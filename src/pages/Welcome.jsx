import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BellRing, CheckCircle2, ClipboardList } from 'lucide-react'
import AnimatedLogo from '../components/logo/AnimatedLogo'

export default function Welcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.14),_transparent_32%),linear-gradient(180deg,_#fbf9f6_0%,_#f4f1ec_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.16),_transparent_32%),linear-gradient(180deg,_#121415_0%,_#17191c_100%)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div>
          <AnimatedLogo size="clamp(320px, 78vw, 640px)" />
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
          {t('app.name')}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-600 dark:text-ink-300 sm:text-lg">
          {t('app.tagline')}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-ink-600 dark:text-ink-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm dark:bg-white/5">
            <CheckCircle2 size={16} className="text-status-healthy" />
            {t('welcome.realtime')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm dark:bg-white/5">
            <ClipboardList size={16} className="text-clay-500" />
            {t('welcome.history')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm dark:bg-white/5">
            <BellRing size={16} className="text-status-watch" />
            {t('welcome.alerts')}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-8 py-3 text-base shadow-[0_18px_45px_rgba(160,114,58,0.22)]"
          >
            {t('welcome.goToLogin')}
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="rounded-full border border-clay-500/20 bg-white/80 px-8 py-3 text-base font-semibold text-clay-600 shadow-sm transition-colors hover:bg-clay-500/5 dark:bg-white/5 dark:text-ink-100"
          >
            {t('welcome.createAccount')}
          </button>
        </div>
      </div>
    </div>
  )
}
