import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, serviceRoleKey)

Deno.serve(async (request) => {
  try {
    const { action, email, name, assigned_area, user_id } = await request.json()

    if (action === 'invite') {
      if (!email || !name) {
        return Response.json({ error: 'email and name are required' }, { status: 400 })
      }

      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { name, role: 'storekeeper', assigned_area: assigned_area ?? null },
      })

      if (error) return Response.json({ error: error.message }, { status: 400 })

      if (data.user?.id) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name,
          role: 'storekeeper',
        })
      }

      return Response.json({ ok: true, user: data.user })
    }

    if (action === 'deactivate') {
      if (!user_id) {
        return Response.json({ error: 'user_id is required' }, { status: 400 })
      }

      const { error } = await supabase.auth.admin.deleteUser(user_id)
      if (error) return Response.json({ error: error.message }, { status: 400 })

      return Response.json({ ok: true })
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

