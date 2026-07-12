import React from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useInventorySnapshot from '../hooks/useInventorySnapshot'

export default function Analytics() {
  const { t } = useTranslation()
  const { snapshot } = useInventorySnapshot()
  const usageByDay = snapshot?.usageByDay ?? []
  const topFive = [...(snapshot?.materials ?? []).filter((material) => !material.is_archived)]
    .sort((left, right) => right.current_quantity - left.current_quantity)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">Analytics</p>
        <h1 className="mt-2 text-2xl font-bold">{t('analytics.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
          A sharper view of site demand, current stock depth, and how inventory is moving over time.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-500">Usage over time</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={usageByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-700" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E4E6E8', fontSize: 13 }} />
            <Line type="monotone" dataKey="usage" stroke="#A0723A" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink-500">Top 5 materials by current stock</h2>
        <ul className="space-y-3">
          {topFive.map((material, index) => (
            <li key={material.id} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay-50 text-xs font-bold text-clay-600 dark:bg-ink-700">
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{material.name}</span>
              <span className="text-sm text-ink-400">{material.current_quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
