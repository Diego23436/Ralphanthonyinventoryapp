import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import useInventorySnapshot from '../hooks/useInventorySnapshot'
import { markNotificationRead } from '../lib/inventoryApi'

export default function Notifications() {
  const { t } = useTranslation()
  const { snapshot, loading, refresh } = useInventorySnapshot()
  const notifications = snapshot?.notifications ?? []

  async function handleMarkRead(notificationId) {
    const { error } = await markNotificationRead(notificationId)
    if (!error) refresh()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">{t('notifications.signals')}</p>
        <h1 className="mt-2 text-2xl font-bold">{t('notifications.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
          {t('notifications.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-ink-100 bg-white/80 p-5 text-sm text-ink-500 shadow-sm dark:border-ink-700 dark:bg-ink-900/60">
          {t('notifications.loading')}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink-400">{t('notifications.empty')}</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className="card flex items-center gap-3 p-4">
              <AlertTriangle className={notification.is_read ? 'text-ink-300' : 'text-status-low'} size={18} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{notification.message}</p>
                <p className="text-xs text-ink-400">
                  {new Date(notification.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notification.id)}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  <CheckCircle2 size={14} /> {t('notifications.markRead')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
