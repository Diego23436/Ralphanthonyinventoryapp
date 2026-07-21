import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: signUpError } = await signUp(form)
    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setMessage(t('signup.created'))
    setTimeout(() => navigate('/login'), 900)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.1),_transparent_28%),linear-gradient(180deg,_#fbf9f6_0%,_#f4f1ec_100%)] px-4 dark:bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.12),_transparent_28%),linear-gradient(180deg,_#15171a_0%,_#111315_100%)]">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">{t('signup.banner')}</p>
          <h1 className="mt-2 text-3xl font-bold">{t('signup.title')}</h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
            {t('signup.subtitle')}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">{t('signup.fullName')}</label>
            <input className="field-input" value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </div>
          <div>
            <label className="field-label">{t('auth.email')}</label>
            <input
              type="email"
              className="field-input"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">{t('auth.password')}</label>
            <input
              type="password"
              className="field-input"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-status-healthy/20 bg-status-healthy/5 px-3 py-2 text-sm text-status-healthy">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus size={16} />
            {loading ? t('signup.creating') : t('signup.create')}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-400">
          {t('signup.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-clay-500 hover:underline">
            {t('signup.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  )
}
