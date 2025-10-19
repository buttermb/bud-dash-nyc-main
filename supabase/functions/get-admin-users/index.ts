import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      throw new Error('Admin access required');
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get auth users using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Create a map of user emails and last sign in
    const authMap = new Map(
      authData.users.map(u => [
        u.id,
        { email: u.email, last_sign_in_at: u.last_sign_in_at }
      ])
    );

    // Get orders for each user
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('user_id, total_amount, status');

    // Group orders by user
    const ordersByUser = new Map<string, any[]>();
    (orders || []).forEach(order => {
      if (!order.user_id) return;
      if (!ordersByUser.has(order.user_id)) {
        ordersByUser.set(order.user_id, []);
      }
      ordersByUser.get(order.user_id)!.push(order);
    });

    // Enrich profiles with email and order data
    const enrichedProfiles = profiles.map(profile => {
      const authInfo = authMap.get(profile.user_id);
      const userOrders = ordersByUser.get(profile.user_id) || [];
      
      return {
        ...profile,
        email: authInfo?.email || 'N/A',
        last_sign_in: authInfo?.last_sign_in_at || null,
        order_count: userOrders.length,
        total_spent: userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
        pending_orders: userOrders.filter(o => 
          ['pending', 'accepted', 'picked_up'].includes(o.status || '')
        ).length,
      };
    });

    return new Response(
      JSON.stringify({ users: enrichedProfiles }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-admin-users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});