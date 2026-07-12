import React from 'react'

export default function KpiCard({ label, value, icon: Icon, accent = 'text-clay-500' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      {Icon && (
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clay-50 dark:bg-ink-700 ${accent}`}>
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-ink-900 dark:text-white font-display">{value}</p>
        <p className="text-xs font-medium text-ink-400">{label}</p>
      </div>
    </div>
  )
}
