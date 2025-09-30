import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Payment processing not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, paymentMethod } = await req.json();

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (paymentMethod === "crypto") {
      // SECURITY: Crypto payments require proper verification
      // This should integrate with a payment processor like Coinbase Commerce, BTCPay, or NOWPayments
      // For MVP: Mark as pending and require manual verification
      
      await supabase
        .from("orders")
        .update({ 
          payment_status: "pending_verification",
          status: "pending_payment"
        })
        .eq("id", orderId);

      // Log for manual verification
      await supabase.from("audit_logs").insert({
        entity_type: "payment",
        entity_id: orderId,
        action: "CRYPTO_PAYMENT_INITIATED",
        user_id: user.id,
        details: { 
          amount: order.total_amount,
          method: "crypto",
          warning: "Requires manual verification"
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Crypto payment initiated. You will receive payment instructions via email. Order will be processed after payment confirmation.",
          requiresVerification: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (paymentMethod === "card") {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(order.total_amount) * 100),
        currency: "usd",
        metadata: {
          orderId: order.id,
          userId: user.id,
        },
      });

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Cash on delivery - mark as pending
      await supabase
        .from("orders")
        .update({ payment_status: "pending" })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Cash on delivery confirmed. Please have exact change ready.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Process payment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Payment processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
