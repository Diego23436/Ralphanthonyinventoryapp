import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function createNoopQuery(errorMessage) {
  const error = new Error(errorMessage)
  const result = Promise.resolve({ data: null, error })
  const query = {
    select() {
      return query
    },
    order() {
      return query
    },
    limit() {
      return query
    },
    eq() {
      return query
    },
    insert() {
      return query
    },
    update() {
      return query
    },
    delete() {
      return query
    },
    single: async () => ({ data: null, error }),
    then: (...args) => result.then(...args),
    catch: (...args) => result.catch(...args),
    finally: (...args) => result.finally(...args),
  }
  return query
}

function createNoopSupabase() {
  const errorMessage = 'Supabase is not configured'
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error(errorMessage) }),
      signOut: async () => ({ error: null }),
    },
    from: () => createNoopQuery(errorMessage),
    channel: () => ({ on() { return this }, subscribe() { return this } }),
    removeChannel: () => {},
    functions: {
      invoke: async () => ({ data: null, error: new Error(errorMessage) }),
    },
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopSupabase()
