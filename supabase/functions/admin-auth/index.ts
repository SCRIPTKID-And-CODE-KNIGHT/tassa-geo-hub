import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hash, compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, username, password, materialData, announcementData, materialId, announcementId, newUsername, newPassword } = await req.json()

    switch (action) {
      case 'login':
        // Authenticate admin
        const { data: adminUser } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .single()

        if (!adminUser || !await compare(password, adminUser.password_hash)) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'create_material':
        const { error: createError } = await supabaseClient
          .from('materials')
          .insert(materialData)

        if (createError) throw createError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'update_material':
        const { error: updateError } = await supabaseClient
          .from('materials')
          .update(materialData)
          .eq('id', materialId)

        if (updateError) throw updateError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'delete_material':
        const { error: deleteError } = await supabaseClient
          .from('materials')
          .delete()
          .eq('id', materialId)

        if (deleteError) throw deleteError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'create_announcement':
        const { error: createAnnError } = await supabaseClient
          .from('announcements')
          .insert(announcementData)

        if (createAnnError) throw createAnnError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'update_announcement':
        const { error: updateAnnError } = await supabaseClient
          .from('announcements')
          .update(announcementData)
          .eq('id', announcementId)

        if (updateAnnError) throw updateAnnError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'delete_announcement':
        const { error: deleteAnnError } = await supabaseClient
          .from('announcements')
          .delete()
          .eq('id', announcementId)

        if (deleteAnnError) throw deleteAnnError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'create_admin':
        const hashedPassword = await hash(newPassword)
        const { error: createAdminError } = await supabaseClient
          .from('admin_users')
          .insert({
            username: newUsername,
            password_hash: hashedPassword
          })

        if (createAdminError) throw createAdminError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})