import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { deactivateStorekeeper, inviteStorekeeper, listStorekeepers } from '../lib/adminApi'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { user, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [storekeepers, setStorekeepers] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [inviteBusy, setInviteBusy] = useState(false)

  useEffect(() => {
    if (!isAdmin) return

    let active = true
    async function loadTeam() {
      setLoadingTeam(true)
      setTeamError('')
      const { data, error } = await listStorekeepers()
      if (!active) return
      if (error) setTeamError(error.message)
      else setStorekeepers(data ?? [])
      setLoadingTeam(false)
    }

    loadTeam()
    return () => {
      active = false
    }
  }, [isAdmin])

  async function handleInvite(event) {
    event.preventDefault()
    setInviteBusy(true)
    setActionMessage('')
    setTeamError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      name: formData.get('name'),
      assigned_area: formData.get('assigned_area'),
    }

    const { error } = await inviteStorekeeper(payload)
    if (error) setTeamError(error.message)
    else setActionMessage('Invitation sent to the new storekeeper.')
    setInviteBusy(false)
  }

  async function handleDeactivate(userId) {
    setActionMessage('')
    const { error } = await deactivateStorekeeper(userId)
    if (error) {
      setTeamError(error.message)
      return
    }
    setActionMessage('Account deactivated.')
    setStorekeepers((current) => current.filter((member) => member.id !== userId))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">Profile and access</p>
        <h1 className="mt-2 text-2xl font-bold">{t('settings.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
          Personal preferences stay simple. Admins also get a full account-management panel for storekeepers.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-ink-500">Profile</h2>
        <div>
          <label className="field-label">Name</label>
          <input className="field-input" defaultValue={user?.name} />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input className="field-input" placeholder="+237 6XX XXX XXX" />
        </div>
        <button className="btn-secondary">Change password</button>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-ink-500">Preferences</h2>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Language</span>
          <div className="flex gap-2">
            {['en', 'fr'].map((lng) => (
              <button
                key={lng}
                onClick={() => i18n.changeLanguage(lng)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  i18n.language === lng ? 'bg-clay-500 text-white' : 'bg-ink-50 text-ink-500 dark:bg-ink-700'
                }`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Theme</span>
          <button onClick={toggleTheme} className="btn-secondary !px-3 !py-1.5 text-xs">
            {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink-500">Storekeeper accounts</h2>
                <p className="text-xs text-ink-400">Invite new storekeepers or deactivate former staff.</p>
              </div>
              {loadingTeam && <span className="text-xs text-ink-400">Refreshing...</span>}
            </div>

            {teamError && (
              <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
                {teamError}
              </p>
            )}
            {actionMessage && (
              <p className="rounded-xl border border-status-healthy/20 bg-status-healthy/5 px-3 py-2 text-sm text-status-healthy">
                {actionMessage}
              </p>
            )}

            <div className="space-y-3">
              {storekeepers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-ink-700 dark:bg-ink-800/40"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-ink-400">{member.id}</p>
                  </div>
                  <button onClick={() => handleDeactivate(member.id)} className="btn-secondary !px-3 !py-2 text-xs">
                    Deactivate
                  </button>
                </div>
              ))}
              {!loadingTeam && storekeepers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
                  No storekeepers found yet.
                </div>
              )}
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <h2 className="text-sm font-semibold text-ink-500">Invite storekeeper</h2>
            <form className="space-y-4" onSubmit={handleInvite}>
              <div>
                <label className="field-label">Name</label>
                <input name="name" required className="field-input" placeholder="Full name" />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input name="email" type="email" required className="field-input" placeholder="name@company.com" />
              </div>
              <div>
                <label className="field-label">Assigned area</label>
                <input name="assigned_area" className="field-input" placeholder="Optional site / zone" />
              </div>

              <button type="submit" disabled={inviteBusy} className="btn-primary w-full">
                {inviteBusy ? 'Sending...' : '+ Invite storekeeper'}
              </button>
            </form>
            <p className="text-xs text-ink-400">
              This calls a Supabase Edge Function, which should use the Auth admin API on the server side.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

