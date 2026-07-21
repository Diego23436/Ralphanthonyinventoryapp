import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">{t('settings.profileAccess')}</p>
        <h1 className="mt-2 text-2xl font-bold">{t('settings.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-ink-500">{t('settings.profile')}</h2>
        <div>
          <label className="field-label">{t('signup.fullName')}</label>
          <input className="field-input" defaultValue={user?.name} />
        </div>
        <div>
          <label className="field-label">{t('settings.phone')}</label>
          <input className="field-input" placeholder={t('settings.phonePlaceholder')} />
        </div>
        <button className="btn-secondary">{t('settings.changePassword')}</button>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-ink-500">{t('settings.preferences')}</h2>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">{t('settings.language')}</span>
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
          <span className="text-sm font-medium">{t('settings.theme')}</span>
          <button onClick={toggleTheme} className="btn-secondary !px-3 !py-1.5 text-xs">
            {theme === 'light' ? t('settings.switchToDark') : t('settings.switchToLight')}
          </button>
        </div>
      </div>
    </div>
  )
}
