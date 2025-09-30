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

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    console.log("Admin dashboard request:", { endpoint, adminUser: adminUser.email });

    // ==================== DASHBOARD OVERVIEW ====================
    if (endpoint === "overview") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: totalOrders },
        { count: todayOrders },
        { count: activeOrders },
        { count: totalUsers },
        { count: totalMerchants },
        { count: activeCouriers },
        { count: pendingVerifications },
        { count: flaggedOrders },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed", "preparing", "out_for_delivery"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("merchants").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("couriers").select("*", { count: "exact", head: true }).eq("is_online", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("age_verified", false),
        supabase.from("orders").select("*", { count: "exact", head: true }).not("flagged_reason", "is", null),
      ]);

      // Calculate today's revenue
      const { data: todayRevenue } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", today.toISOString())
        .not("status", "eq", "cancelled");

      const revenue = todayRevenue?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      await logAdminAction(supabase, adminUser.id, "VIEW_DASHBOARD_OVERVIEW", undefined, undefined, undefined, req);

      return new Response(
        JSON.stringify({
          metrics: {
            totalOrders: totalOrders || 0,
            todayOrders: todayOrders || 0,
            activeOrders: activeOrders || 0,
            totalUsers: totalUsers || 0,
            totalMerchants: totalMerchants || 0,
            activeCouriers: activeCouriers || 0,
            pendingVerifications: pendingVerifications || 0,
            flaggedOrders: flaggedOrders || 0,
            todayRevenue: revenue,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== LIVE DELIVERIES ====================
    if (endpoint === "live-deliveries") {
      const { data: deliveries } = await supabase
        .from("deliveries")
        .select(`
          *,
          order:orders (
            *,
            user:profiles!orders_user_id_fkey (user_id, phone),
            merchant:merchants (*),
            address:addresses (*),
            items:order_items (
              *,
              product:products (name, category)
            )
          ),
          courier:couriers (*)
        `)
        .is("actual_dropoff_time", null)
        .order("created_at", { ascending: false });

      await logAdminAction(supabase, adminUser.id, "VIEW_LIVE_DELIVERIES", undefined, undefined, { count: deliveries?.length || 0 }, req);

      return new Response(
        JSON.stringify({ deliveries: deliveries || [], count: deliveries?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== ORDERS LIST ====================
    if (endpoint === "orders") {
      const status = url.searchParams.get("status");
      const merchantId = url.searchParams.get("merchantId");
      const courierId = url.searchParams.get("courierId");
      const flagged = url.searchParams.get("flagged");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      let query = supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (user_id, phone, age_verified),
          merchant:merchants (id, business_name, license_number),
          courier:couriers (id, full_name, phone),
          address:addresses (*),
          items:order_items (
            *,
            product:products (*)
          ),
          delivery:deliveries (*)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) query = query.eq("status", status);
      if (merchantId) query = query.eq("merchant_id", merchantId);
      if (courierId) query = query.eq("courier_id", courierId);
      if (flagged === "true") query = query.not("flagged_reason", "is", null);

      const { data: orders, count } = await query;

      return new Response(
        JSON.stringify({
          orders: orders || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== ORDER DETAILS ====================
    if (endpoint === "order-details") {
      const orderId = url.searchParams.get("orderId");
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Order ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: order } = await supabase
        .from("orders")
        .select(`
          *,
          user:profiles!orders_user_id_fkey (*),
          merchant:merchants (*),
          courier:couriers (*),
          address:addresses (*),
          items:order_items (
            *,
            product:products (*)
          ),
          tracking:order_tracking (*)
        `)
        .eq("id", orderId)
        .single();

      if (!order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get age verifications
      const { data: verifications } = await supabase
        .from("age_verifications")
        .select("*")
        .eq("user_id", order.user_id)
        .order("created_at", { ascending: false });

      await logAdminAction(supabase, adminUser.id, "VIEW_ORDER_DETAILS", "order", orderId, undefined, req);

      return new Response(
        JSON.stringify({ order, verifications: verifications || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== COMPLIANCE DASHBOARD ====================
    if (endpoint === "compliance") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [
        { count: unverifiedUsers },
        { count: todayVerifications },
        { count: failedVerifications },
        { count: flaggedOrders },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("age_verified", false).lt("created_at", yesterday.toISOString()),
        supabase.from("age_verifications").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("age_verifications").select("*", { count: "exact", head: true }).eq("verified", false),
        supabase.from("orders").select("*", { count: "exact", head: true }).not("flagged_reason", "is", null),
      ]);

      return new Response(
        JSON.stringify({
          unverifiedUsers: unverifiedUsers || 0,
          todayVerifications: todayVerifications || 0,
          failedVerifications: failedVerifications || 0,
          flaggedOrders: flaggedOrders || 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== REALTIME STATS ====================
    if (endpoint === "realtime-stats") {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const [
        { count: ordersLastHour },
        { data: revenueData },
        { count: activeCouriers },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", hourAgo.toISOString()),
        supabase.from("orders").select("total_amount").gte("created_at", hourAgo.toISOString()).neq("status", "cancelled"),
        supabase.from("couriers").select("*", { count: "exact", head: true }).eq("is_online", true),
      ]);

      const revenueLastHour = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      // Calculate average delivery time
      const { data: recentDeliveries } = await supabase
        .from("deliveries")
        .select("estimated_pickup_time, actual_dropoff_time")
        .not("actual_dropoff_time", "is", null)
        .gte("actual_dropoff_time", hourAgo.toISOString());

      let avgDeliveryTime = 0;
      if (recentDeliveries && recentDeliveries.length > 0) {
        const totalMinutes = recentDeliveries.reduce((sum, del) => {
          if (del.estimated_pickup_time && del.actual_dropoff_time) {
            const diff = new Date(del.actual_dropoff_time).getTime() - new Date(del.estimated_pickup_time).getTime();
            return sum + (diff / 1000 / 60);
          }
          return sum;
        }, 0);
        avgDeliveryTime = Math.round(totalMinutes / recentDeliveries.length);
      }

      return new Response(
        JSON.stringify({
          ordersLastHour: ordersLastHour || 0,
          revenueLastHour,
          activeCouriers: activeCouriers || 0,
          avgDeliveryTime,
          activeUsers: 0, // Would need Redis or session tracking
          timestamp: now,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== HEATMAP DATA ====================
    if (endpoint === "heatmap") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const type = url.searchParams.get("type") || "orders";
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      let heatmapData: Array<{ lat: number; lng: number; intensity: number }> = [];
      
      if (type === "orders") {
        const { data: orders } = await supabase
          .from("orders")
          .select(`
            total_amount,
            address:addresses (lat, lng)
          `)
          .gte("created_at", startDate.toISOString())
          .eq("status", "delivered");

        heatmapData = orders?.filter(o => o.address).map(order => ({
          lat: parseFloat(order.address.lat),
          lng: parseFloat(order.address.lng),
          intensity: parseFloat(order.total_amount),
        })) || [];
      } else if (type === "users") {
        const { data: addresses } = await supabase
          .from("addresses")
          .select("lat, lng, user_id")
          .eq("is_default", true);

        heatmapData = addresses?.map(addr => ({
          lat: parseFloat(addr.lat),
          lng: parseFloat(addr.lng),
          intensity: 1,
        })) || [];
      }
      
      return new Response(
        JSON.stringify({
          heatmapData,
          count: heatmapData.length,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== SALES ANALYTICS ====================
    if (endpoint === "sales-analytics") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .gte("created_at", startDate.toISOString())
        .neq("status", "cancelled");

      // Group by day
      const salesByDay: Record<string, { date: string; revenue: number; orders: number }> = {};

      orders?.forEach((order) => {
        const date = order.created_at.split("T")[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { date, revenue: 0, orders: 0 };
        }
        salesByDay[date].revenue += parseFloat(order.total_amount);
        salesByDay[date].orders += 1;
      });

      const chartData = Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date));

      return new Response(
        JSON.stringify({ chartData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Dashboard request failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
