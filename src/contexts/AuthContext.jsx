import React, { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const DEV_ADMIN = {
  email: 'admin@ralphanthony.test',
  password: 'admin123',
  profile: { id: 'dev-admin', name: 'Admin User', role: 'admin' },
}

function readStoredUser() {
  try {
    const stored = localStorage.getItem('ra_dev_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem('ra_dev_user')
    return null
  }
}

async function loadProfile(userId) {
  const { data, error } = await supabase.from('users').select('id, name, role').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

function createSetupError() {
  return new Error(
    'Supabase is not configured yet. Add your project URL and anon key to .env, then restart the dev server.'
  )
}

function normalizeAuthError(error) {
  if (!error) return null
  if (error.message?.toLowerCase().includes('failed to fetch')) {
    return new Error(
      'Failed to reach Supabase. Check your VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and that the project is reachable from this device.'
    )
  }
  return error instanceof Error ? error : new Error('Authentication failed.')
}

function fallbackProfile(userId, email) {
  return {
    id: userId,
    name: email ? email.split('@')[0] : 'User',
    role: 'storekeeper',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const storedUser = readStoredUser()
      if (storedUser && !isSupabaseConfigured && active) setUser(storedUser)

      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          if (active) {
            const nextProfile = profile ?? fallbackProfile(session.user.id, session.user.email)
            setUser(nextProfile)
            localStorage.setItem('ra_dev_user', JSON.stringify(nextProfile))
          }
        } else if (isSupabaseConfigured) {
          localStorage.removeItem('ra_dev_user')
          if (active) setUser(null)
        }
      } catch {
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrap()

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          const nextProfile = profile ?? fallbackProfile(session.user.id, session.user.email)
          setUser(nextProfile)
          localStorage.setItem('ra_dev_user', JSON.stringify(nextProfile))
        } else {
          localStorage.removeItem('ra_dev_user')
          setUser(null)
        }
      } catch {
        localStorage.removeItem('ra_dev_user')
        setUser(null)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!isSupabaseConfigured && email === DEV_ADMIN.email && password === DEV_ADMIN.password) {
      setUser(DEV_ADMIN.profile)
      localStorage.setItem('ra_dev_user', JSON.stringify(DEV_ADMIN.profile))
      return { error: null }
    }

    if (!isSupabaseConfigured) {
      return { error: createSetupError() }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: normalizeAuthError(error) }

      const profile = await loadProfile(data.user.id)
      const nextProfile = profile ?? fallbackProfile(data.user.id, data.user.email)
      setUser(nextProfile)
      localStorage.setItem('ra_dev_user', JSON.stringify(nextProfile))
      return { error: null }
    } catch (profileError) {
      return {
        error:
          profileError instanceof Error
            ? normalizeAuthError(profileError) ?? profileError
            : new Error('Signed in, but your profile row could not be loaded.'),
      }
    }
  }

  async function signUp({ email, password, name, role = 'storekeeper' }) {
    if (!isSupabaseConfigured) {
      return { error: createSetupError() }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      })
      if (error) return { error: normalizeAuthError(error) }
      if (data?.user) return { error: null }
      return { error: null }
    } catch (signupError) {
      return { error: normalizeAuthError(signupError) ?? new Error('Unable to create account.') }
    }
  }

  async function signOut() {
    localStorage.removeItem('ra_dev_user')
    await supabase.auth.signOut().catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
