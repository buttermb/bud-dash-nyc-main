import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, email, password } = await req.json();

    if (action === "login") {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", authData.user.id)
        .eq("is_active", true)
        .single();

      if (adminError || !adminUser) {
        // Sign out the user since they're not an admin
        await supabase.auth.signOut();
        return new Response(
          JSON.stringify({ error: "Unauthorized - admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update last login
      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", adminUser.id);

      // Create admin session record
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour expiry

      await supabase.from("admin_sessions").insert({
        admin_id: adminUser.id,
        token_hash: authData.session.access_token.substring(0, 20), // Store partial for tracking
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

      // Log admin login
      await supabase.from("admin_audit_logs").insert({
        admin_id: adminUser.id,
        action: "ADMIN_LOGIN",
        details: { email: adminUser.email },
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      });

      return new Response(
        JSON.stringify({
          session: authData.session,
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            role: adminUser.role,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      // Verify admin status for existing session
      const authHeader = req.headers.get("Authorization")!;
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid session" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (adminError || !adminUser) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            full_name: adminUser.full_name,
            role: adminUser.role,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "logout") {
      const authHeader = req.headers.get("Authorization")!;
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (adminUser) {
          // Log admin logout
          await supabase.from("admin_audit_logs").insert({
            admin_id: adminUser.id,
            action: "ADMIN_LOGOUT",
            ip_address: req.headers.get("x-forwarded-for") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
          });

          // Delete admin session
          await supabase
            .from("admin_sessions")
            .delete()
            .eq("admin_id", adminUser.id)
            .eq("token_hash", token.substring(0, 20));
        }
      }

      await supabase.auth.signOut();

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Authentication failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
