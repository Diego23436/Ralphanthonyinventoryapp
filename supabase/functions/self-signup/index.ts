import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, serviceRoleKey)

Deno.serve(async (request) => {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return Response.json({ error: 'email, password, and name are required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'admin' },
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    if (data.user?.id) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        name,
        role: 'admin',
      })
      if (profileError) {
        return Response.json({ error: profileError.message }, { status: 400 })
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})

