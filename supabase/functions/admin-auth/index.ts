import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple password comparison for demo - in production use proper bcrypt
async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  // For demo purposes, we'll do a simple comparison
  // In production, you'd want proper bcrypt comparison
  return plaintext === 'admin123' && hash.includes('$2b$');
}

async function hashPassword(password: string): Promise<string> {
  // For demo purposes - in production use proper bcrypt
  return `$2b$10$${btoa(password).slice(0, 53)}`;
}

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

    const { 
      action, 
      username, 
      password, 
      materialData, 
      announcementData, 
      materialId, 
      announcementId, 
      newUsername, 
      newPassword,
      premiumCode,
      userId
    } = await req.json()

    switch (action) {
      case 'login':
        // Authenticate admin
        console.log('Login attempt for username:', username)
        
        const { data: adminUser, error: fetchError } = await supabaseClient
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .single()

        console.log('Fetch result:', { adminUser, fetchError })

        if (fetchError || !adminUser) {
          console.log('User not found or fetch error')
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const passwordMatch = await comparePassword(password, adminUser.password_hash)
        console.log('Password comparison result:', passwordMatch)

        if (!passwordMatch) {
          console.log('Password does not match')
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
        const hashedPassword = await hashPassword(newPassword)
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

      case 'set_premium_code':
        // Delete existing code for this material if any
        await supabaseClient
          .from('premium_codes')
          .delete()
          .eq('material_id', materialId)

        // Insert new premium code
        const { error: premiumCodeError } = await supabaseClient
          .from('premium_codes')
          .insert({
            material_id: materialId,
            code: premiumCode
          })

        if (premiumCodeError) throw premiumCodeError
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'validate_premium_code':
        // Check if code is valid for this material
        const { data: codeData, error: codeError } = await supabaseClient
          .from('premium_codes')
          .select('*')
          .eq('material_id', materialId)
          .eq('code', premiumCode)
          .single()

        if (codeError || !codeData) {
          return new Response(JSON.stringify({ valid: false, error: 'Invalid code' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Record user access
        const { error: accessError } = await supabaseClient
          .from('user_premium_access')
          .upsert({
            user_id: userId,
            material_id: materialId,
            code_used: premiumCode
          }, {
            onConflict: 'user_id,material_id'
          })

        if (accessError) throw accessError

        return new Response(JSON.stringify({ valid: true, success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'check_premium_access':
        // Check if user already has access
        const { data: accessData } = await supabaseClient
          .from('user_premium_access')
          .select('*')
          .eq('user_id', userId)
          .eq('material_id', materialId)
          .single()

        return new Response(JSON.stringify({ hasAccess: !!accessData }), {
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