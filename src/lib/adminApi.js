import { supabase } from './supabaseClient'
import { isSupabaseConfigured } from './inventoryApi'

export async function listAdmins() {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase is not configured.') }
  }

  return supabase.from('users').select('id, name, role, created_at').eq('role', 'admin').order('name')
}

export async function inviteAdmin(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.functions.invoke('admin-account-management', {
    body: { action: 'invite', ...payload },
  })
}

export async function deactivateAdmin(userId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.functions.invoke('admin-account-management', {
    body: { action: 'deactivate', user_id: userId },
  })
}
