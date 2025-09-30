import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NYC Purchase Limits (per day)
const LIMITS = {
  FLOWER_GRAMS: 85.05, // 3 ounces
  CONCENTRATE_GRAMS: 24,
};

// Calculate delivery fee based on borough and distance
function calculateDeliveryFee(borough: string, distanceMiles: number): number {
  const baseFee = 5.0;
  const manhattanSurcharge = borough === "Manhattan" ? 5.0 : 0;
  const distanceFee = distanceMiles > 2 ? (distanceMiles - 2) * 1.0 : 0;
  return baseFee + manhattanSurcharge + distanceFee;
}

// Check NYC geofencing
function isValidBorough(borough: string): boolean {
  const validBoroughs = ["Brooklyn", "Queens", "Manhattan", "Bronx", "Staten Island"];
  return validBoroughs.includes(borough);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate input
    const rawInput = await req.json();
    
    // Input validation
    if (!rawInput.items || !Array.isArray(rawInput.items) || rawInput.items.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (rawInput.items.length > 50) {
      return new Response(JSON.stringify({ error: "Too many items in order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = rawInput.items;
    const addressId = String(rawInput.addressId || '').slice(0, 36);
    const paymentMethod = String(rawInput.paymentMethod || '').slice(0, 20);

    if (!['cash', 'card', 'crypto'].includes(paymentMethod)) {
      return new Response(JSON.stringify({ error: "Invalid payment method" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify age verification
    const { data: profile } = await supabase
      .from("profiles")
      .select("age_verified")
      .eq("user_id", user.id)
      .single();

    if (!profile?.age_verified) {
      return new Response(
        JSON.stringify({ error: "Age verification required to place orders" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get address
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .single();

    if (addressError || !address) {
      return new Response(
        JSON.stringify({ error: "Invalid delivery address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check geofencing
    if (!isValidBorough(address.borough)) {
      return new Response(
        JSON.stringify({ error: "Delivery not available in this area. We only serve NYC." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate purchase totals
    let flowerGrams = 0;
    let concentrateGrams = 0;
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("*, inventory(*)")
        .eq("id", item.productId)
        .single();

      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.productId} not found` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check inventory
      if (!product.inventory || product.inventory.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate weights for compliance
      const weightGrams = parseFloat(product.weight_grams || 0) * item.quantity;
      if (product.is_concentrate) {
        concentrateGrams += weightGrams;
      } else if (product.category === "flower") {
        flowerGrams += weightGrams;
      }

      subtotal += parseFloat(product.price) * item.quantity;

      orderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        price: product.price,
        product_name: product.name,
      });
    }

    // Check purchase limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingLimit } = await supabase
      .from("purchase_limits")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today.toISOString().split("T")[0])
      .single();

    const currentFlower = parseFloat(existingLimit?.flower_grams || 0);
    const currentConcentrate = parseFloat(existingLimit?.concentrate_grams || 0);

    if (currentFlower + flowerGrams > LIMITS.FLOWER_GRAMS) {
      const remaining = LIMITS.FLOWER_GRAMS - currentFlower;
      return new Response(
        JSON.stringify({
          error: `Order exceeds daily flower limit. You have ${remaining.toFixed(1)}g remaining today.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (currentConcentrate + concentrateGrams > LIMITS.CONCENTRATE_GRAMS) {
      const remaining = LIMITS.CONCENTRATE_GRAMS - currentConcentrate;
      return new Response(
        JSON.stringify({
          error: `Order exceeds daily concentrate limit. You have ${remaining.toFixed(1)}g remaining today.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate fees
    const deliveryFee = calculateDeliveryFee(address.borough, 3.5); // Simplified distance
    const total = subtotal + deliveryFee;

    // Get merchant from first product
    const { data: firstProduct } = await supabase
      .from("products")
      .select("merchant_id")
      .eq("id", items[0].productId)
      .single();

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        merchant_id: firstProduct!.merchant_id,
        address_id: addressId,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        payment_method: paymentMethod,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }))
    );

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update inventory using secure RPC function
    for (const item of items) {
      const { data: inventorySuccess, error: inventoryError } = await supabase.rpc('decrement_inventory', {
        _product_id: item.productId,
        _quantity: item.quantity
      });

      if (inventoryError || !inventorySuccess) {
        console.error('Inventory update error:', inventoryError);
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id);
        await supabase.from('order_items').delete().eq('order_id', order.id);
        
        return new Response(
          JSON.stringify({ error: 'Failed to update inventory - insufficient stock' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update purchase limits using secure function
    const { error: limitsError } = await supabase.rpc('update_purchase_limits', {
      _user_id: user.id,
      _date: today.toISOString().split('T')[0],
      _flower_grams: flowerGrams,
      _concentrate_grams: concentrateGrams
    });

    if (limitsError) {
      console.error('Failed to update purchase limits:', limitsError);
      // Continue anyway as order is already created
    }

    // Create initial tracking entry
    await supabase.from("order_tracking").insert({
      order_id: order.id,
      status: "pending",
      message: "Order placed successfully",
    });

    // Create audit log
    await supabase.from("audit_logs").insert({
      entity_type: "order",
      entity_id: order.id,
      action: "CREATE",
      user_id: user.id,
      details: { order_number: orderNumber, total, items: orderItems.length },
    });

    return new Response(JSON.stringify({ order, orderNumber }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
