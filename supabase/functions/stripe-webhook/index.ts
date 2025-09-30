import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("No orderId in session metadata");
        return new Response(
          JSON.stringify({ error: "Missing order ID" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update order status
      await supabase
        .from("orders")
        .update({ 
          payment_status: "paid",
          status: "confirmed"
        })
        .eq("id", orderId);

      // Add tracking update
      await supabase.from("order_tracking").insert({
        order_id: orderId,
        status: "confirmed",
        message: "Payment received successfully",
      });

      // Log payment
      await supabase.from("audit_logs").insert({
        entity_type: "payment",
        entity_id: orderId,
        action: "PAYMENT_COMPLETED",
        user_id: session.metadata?.userId,
        details: { 
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency
        }
      });

      console.log(`Payment successful for order ${orderId}`);
    }

    // Handle payment_intent.payment_failed event
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ 
            payment_status: "failed",
            status: "cancelled"
          })
          .eq("id", orderId);

        await supabase.from("order_tracking").insert({
          order_id: orderId,
          status: "cancelled",
          message: "Payment failed",
        });

        await supabase.from("audit_logs").insert({
          entity_type: "payment",
          entity_id: orderId,
          action: "PAYMENT_FAILED",
          details: { 
            paymentIntentId: paymentIntent.id,
            error: paymentIntent.last_payment_error?.message
          }
        });
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Webhook handler failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
