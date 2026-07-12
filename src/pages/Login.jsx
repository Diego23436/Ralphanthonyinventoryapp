import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, ShieldCheck, WifiOff, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BrandMark from '../components/logo/BrandMark'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const locked = attempts >= 5

  async function handleSubmit(event) {
    event.preventDefault()
    if (locked) return
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)
    setLoading(false)

    if (signInError) {
      setAttempts((current) => current + 1)
      setError(signInError.message || t('auth.error'))
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.1),_transparent_28%),linear-gradient(180deg,_#fbf9f6_0%,_#f4f1ec_100%)] px-4 py-6 dark:bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.12),_transparent_28%),linear-gradient(180deg,_#15171a_0%,_#111315_100%)]">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60 sm:p-8">
          <BrandMark size={72} className="mb-6 w-full justify-start sm:w-auto" />
          <h1 className="text-3xl font-bold">{t('auth.login')}</h1>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-300">
            Sign in to track materials, sync activity in realtime, and keep the site moving even when connectivity is
            patchy.
          </p>

          <div className="mt-7 space-y-3">
            {[
              { icon: ShieldCheck, title: 'Secure role access', text: 'Admin and storekeeper views stay separated.' },
              { icon: WifiOff, title: 'Offline resilient', text: 'Queued submissions auto-sync when the network returns.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-2xl bg-ink-50/80 p-4 dark:bg-ink-800/60">
                <div className="mt-0.5 rounded-xl bg-clay-500/10 p-2 text-clay-600 dark:text-clay-300">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-300">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-5 sm:p-8">
          <div>
            <label className="field-label" htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-input"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
              placeholder="********"
            />
          </div>

          {error && !locked && (
            <p role="alert" className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm font-medium text-status-low">
              {error}
            </p>
          )}
          {locked && (
            <p role="alert" className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm font-medium text-status-low">
              Too many failed attempts. Please wait a moment before trying again.
            </p>
          )}

          <button type="submit" disabled={loading || locked} className="btn-primary w-full py-3.5 text-base">
            <LogIn size={16} />
            {loading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>

          <div className="flex flex-col gap-3 text-center text-xs text-ink-400">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-clay-500/20 bg-clay-500/5 px-4 py-2 font-semibold text-clay-500 transition-colors hover:bg-clay-500/10"
            >
              <UserPlus size={14} />
              Create a new account
            </Link>
            <p>
              If Supabase is not configured yet, the app will still render but sign-in will return a setup message.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
