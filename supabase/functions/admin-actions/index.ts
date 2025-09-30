import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function logAdminAction(
  supabase: any,
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any,
  req?: Request
) {
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: req?.headers.get("x-forwarded-for") || "unknown",
    user_agent: req?.headers.get("user-agent") || "unknown",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminUser) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, orderId, reason, userId, details } = await req.json();

    // ==================== CANCEL ORDER ====================
    if (action === "cancel-order") {
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Order ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: "refunded",
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to cancel order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add tracking entry
      await supabase.from("order_tracking").insert({
        order_id: orderId,
        status: "cancelled",
        message: `Order cancelled by admin: ${reason || "No reason provided"}`,
      });

      await logAdminAction(supabase, adminUser.id, "CANCEL_ORDER", "order", orderId, { reason }, req);

      return new Response(
        JSON.stringify({ success: true, order }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== FLAG ORDER ====================
    if (action === "flag-order") {
      if (!orderId || !reason) {
        return new Response(
          JSON.stringify({ error: "Order ID and reason required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          flagged_reason: reason,
          flagged_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to flag order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await logAdminAction(supabase, adminUser.id, "FLAG_ORDER", "order", orderId, { reason }, req);

      return new Response(
        JSON.stringify({ success: true, order }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== UNFLAG ORDER ====================
    if (action === "unflag-order") {
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Order ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          flagged_reason: null,
          flagged_at: null,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to unflag order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await logAdminAction(supabase, adminUser.id, "UNFLAG_ORDER", "order", orderId, { reason }, req);

      return new Response(
        JSON.stringify({ success: true, order }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== SUSPEND USER ====================
    if (action === "suspend-user") {
      if (!userId || !reason) {
        return new Response(
          JSON.stringify({ error: "User ID and reason required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Note: You'd need to add a suspended field to profiles table
      const { data: profile, error: updateError } = await supabase
        .from("profiles")
        .update({
          age_verified: false, // Revoke access
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to suspend user" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await logAdminAction(supabase, adminUser.id, "SUSPEND_USER", "user", userId, { reason }, req);

      return new Response(
        JSON.stringify({ success: true, profile }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== ASSIGN COURIER ====================
    if (action === "assign-courier") {
      const { courierId } = details || {};
      
      if (!orderId || !courierId) {
        return new Response(
          JSON.stringify({ error: "Order ID and Courier ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order, error: updateError } = await supabase
        .from("orders")
        .update({
          courier_id: courierId,
          status: "confirmed",
        })
        .eq("id", orderId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to assign courier" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Add tracking entry
      await supabase.from("order_tracking").insert({
        order_id: orderId,
        status: "confirmed",
        message: "Courier assigned by admin",
      });

      await logAdminAction(supabase, adminUser.id, "ASSIGN_COURIER", "order", orderId, { courierId }, req);

      return new Response(
        JSON.stringify({ success: true, order }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin action error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Action failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
