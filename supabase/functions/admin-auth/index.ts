import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Proper bcrypt password comparison
async function comparePassword(plaintext: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

// Proper bcrypt password hashing
async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
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
        const { data: newMaterial, error: createError } = await supabaseClient
          .from('materials')
          .insert(materialData)
          .select()
          .single()

        if (createError) throw createError
        return new Response(JSON.stringify({ success: true, material: newMaterial }), {
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
        // Insert new premium code (allow multiple codes per material)
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
        // Check if code is valid for this material and not yet used
        const { data: codeData, error: codeError } = await supabaseClient
          .from('premium_codes')
          .select('*')
          .eq('material_id', materialId)
          .eq('code', premiumCode)
          .is('used_by', null)
          .single()

        if (codeError || !codeData) {
          return new Response(JSON.stringify({ valid: false, error: 'Invalid or already used code' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Mark code as used
        const { error: updateCodeError } = await supabaseClient
          .from('premium_codes')
          .update({
            used_by: userId,
            used_at: new Date().toISOString()
          })
          .eq('id', codeData.id)

        if (updateCodeError) throw updateCodeError

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

      case 'get_material_codes':
        // Get all codes for a material with usage status
        const { data: codes, error: codesError } = await supabaseClient
          .from('premium_codes')
          .select('*')
          .eq('material_id', materialId)
          .order('created_at', { ascending: false })

        if (codesError) throw codesError

        return new Response(JSON.stringify({ codes }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'delete_premium_code':
        const { codeId } = await req.json()
        const { error: deleteCodeError } = await supabaseClient
          .from('premium_codes')
          .delete()
          .eq('id', codeId)

        if (deleteCodeError) throw deleteCodeError
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