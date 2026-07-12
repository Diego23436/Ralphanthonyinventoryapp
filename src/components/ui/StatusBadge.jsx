import React from 'react'

const STYLES = {
  healthy: 'bg-status-healthy/10 text-status-healthy border-status-healthy/30',
  watch: 'bg-status-watch/10 text-status-watch border-status-watch/30',
  low: 'bg-status-low/10 text-status-low border-status-low/30',
}

const LABELS = {
  healthy: 'Healthy',
  watch: 'Watch',
  low: 'Below threshold',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  )
}
