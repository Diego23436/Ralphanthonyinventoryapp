import { supabase } from './supabaseClient'
import { isSupabaseConfigured } from './inventoryApi'

export async function listStorekeepers() {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase is not configured.') }
  }

  return supabase.from('users').select('id, name, role, created_at').eq('role', 'storekeeper').order('name')
}

export async function inviteStorekeeper(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.functions.invoke('admin-account-management', {
    body: { action: 'invite', ...payload },
  })
}

export async function deactivateStorekeeper(userId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.functions.invoke('admin-account-management', {
    body: { action: 'deactivate', user_id: userId },
  })
}

