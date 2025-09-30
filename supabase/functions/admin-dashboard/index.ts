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
      console.log("Fetching live deliveries...");
      
      try {
        // Fetch deliveries
        const { data: deliveries, error } = await supabase
          .from("deliveries")
          .select(`
            *,
            couriers (*)
          `)
          .is("actual_dropoff_time", null)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching deliveries:", error);
          return new Response(
            JSON.stringify({ error: error.message, deliveries: [], count: 0 }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch related orders
        const orderIds = deliveries?.map(d => d.order_id) || [];
        const { data: orders } = await supabase
          .from("orders")
          .select(`
            *,
            merchants (*),
            addresses (*)
          `)
          .in("id", orderIds);

        // Fetch user profiles
        const userIds = [...new Set(orders?.map(o => o.user_id).filter(Boolean) || [])];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        // Fetch order items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select(`
            *,
            products (name, category)
          `)
          .in("order_id", orderIds);

        // Enrich deliveries with order data
        const enrichedDeliveries = deliveries?.map(delivery => {
          const order = orders?.find(o => o.id === delivery.order_id);
          return {
            ...delivery,
            order: order ? {
              ...order,
              user: profiles?.find(p => p.user_id === order.user_id) || null,
              items: orderItems?.filter(item => item.order_id === order.id) || []
            } : null
          };
        }) || [];

        console.log(`Found ${enrichedDeliveries.length} deliveries`);
        await logAdminAction(supabase, adminUser.id, "VIEW_LIVE_DELIVERIES", undefined, undefined, { count: enrichedDeliveries.length }, req);

        return new Response(
          JSON.stringify({ 
            deliveries: enrichedDeliveries, 
            count: enrichedDeliveries.length,
            success: true 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Live deliveries error:", error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', deliveries: [], count: 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ==================== ORDERS LIST ====================
    if (endpoint === "orders") {
      console.log("Fetching orders list...");
      const status = url.searchParams.get("status");
      const merchantId = url.searchParams.get("merchantId");
      const courierId = url.searchParams.get("courierId");
      const flagged = url.searchParams.get("flagged");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "50");

      try {
        let query = supabase
          .from("orders")
          .select(`
            *,
            merchants (id, business_name, license_number),
            couriers (id, full_name, phone),
            addresses (*)
          `, { count: "exact" })
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (status) query = query.eq("status", status);
        if (merchantId) query = query.eq("merchant_id", merchantId);
        if (courierId) query = query.eq("courier_id", courierId);
        if (flagged === "true") query = query.not("flagged_reason", "is", null);

        const { data: orders, count, error } = await query;
        
        if (error) {
          console.error("Orders query error:", error);
          return new Response(
            JSON.stringify({ error: error.message, orders: [], pagination: { page, limit, total: 0, totalPages: 0 } }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch user profiles separately
        const userIds = [...new Set(orders?.map(o => o.user_id).filter(Boolean) || [])];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        // Fetch order items with products
        const orderIds = orders?.map(o => o.id) || [];
        const { data: orderItems } = await supabase
          .from("order_items")
          .select(`
            *,
            products (*)
          `)
          .in("order_id", orderIds);

        // Fetch deliveries
        const { data: deliveries } = await supabase
          .from("deliveries")
          .select("*")
          .in("order_id", orderIds);

        // Combine data
        const enrichedOrders = orders?.map(order => ({
          ...order,
          user: profiles?.find(p => p.user_id === order.user_id) || null,
          items: orderItems?.filter(item => item.order_id === order.id) || [],
          delivery: deliveries?.find(d => d.order_id === order.id) || null
        })) || [];

        console.log(`Found ${enrichedOrders.length} orders, total count: ${count}`);

        return new Response(
          JSON.stringify({
            orders: enrichedOrders,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Orders endpoint error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
          JSON.stringify({ 
            error: errorMessage, 
            orders: [], 
            pagination: { page, limit, total: 0, totalPages: 0 } 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
            address:addresses!orders_address_id_fkey (lat, lng)
          `)
          .gte("created_at", startDate.toISOString())
          .eq("status", "delivered")
          .not("address_id", "is", null);

        heatmapData = orders?.filter(o => o.address && Array.isArray(o.address) && o.address.length > 0).map(order => {
          const addr = Array.isArray(order.address) ? order.address[0] : order.address;
          return {
            lat: parseFloat(addr.lat),
            lng: parseFloat(addr.lng),
            intensity: parseFloat(order.total_amount),
          };
        }) || [];
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

    // ==================== TEST/DEBUG ENDPOINT ====================
    if (endpoint === "test") {
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
        
      const { count: deliveriesCount } = await supabase
        .from("deliveries")
        .select("*", { count: "exact", head: true });
        
      const { count: couriersCount } = await supabase
        .from("couriers")
        .select("*", { count: "exact", head: true });

      return new Response(
        JSON.stringify({
          message: "Admin dashboard is working",
          adminUser: { email: adminUser.email, role: adminUser.role },
          databaseCounts: {
            orders: ordersCount,
            deliveries: deliveriesCount,
            couriers: couriersCount
          }
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
