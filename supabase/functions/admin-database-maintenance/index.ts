import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!adminCheck) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action } = await req.json()

    let result
    switch (action) {
      case 'vacuum':
        // Run VACUUM ANALYZE on all tables
        result = await supabase.rpc('exec_sql', { 
          sql: 'VACUUM ANALYZE;' 
        })
        break
      
      case 'optimize_indexes':
        // Reindex all indexes
        result = await supabase.rpc('exec_sql', { 
          sql: 'REINDEX DATABASE postgres;' 
        })
        break
      
      case 'analyze':
        // Update table statistics
        result = await supabase.rpc('exec_sql', { 
          sql: 'ANALYZE;' 
        })
        break
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    // Log the maintenance action
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminCheck.id,
      action: 'database_maintenance',
      entity_type: 'system',
      entity_id: 'database',
      details: { maintenance_action: action }
    })

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Database ${action} completed successfully`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Database maintenance error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
