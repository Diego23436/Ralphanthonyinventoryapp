import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.12),_transparent_30%),linear-gradient(180deg,_#fbf9f6_0%,_#f4f1ec_100%)] text-center dark:bg-[radial-gradient(circle_at_top,_rgba(160,114,58,0.14),_transparent_30%),linear-gradient(180deg,_#15171a_0%,_#111315_100%)]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay-500">404</p>
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="max-w-md text-sm text-ink-500 dark:text-ink-300">The page you requested does not exist or was moved.</p>
      <Link to="/" className="btn-primary">
        Back home
      </Link>
    </div>
  )
}

