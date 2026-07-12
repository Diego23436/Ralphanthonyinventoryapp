import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  BarChart3,
  Bell,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import BrandMark from '../logo/BrandMark'

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/materials', label: t('nav.materials'), icon: Boxes },
    { to: '/stock-in', label: t('nav.stockIn'), icon: ArrowDownToLine },
    { to: '/stock-out', label: t('nav.stockOut'), icon: ArrowUpFromLine },
    { to: '/history', label: t('nav.history'), icon: History, adminOnly: true },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell, adminOnly: true },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[85vw] max-w-xs flex-col overflow-y-auto bg-ink-800/95 px-3 py-5 transition-transform duration-300 md:static md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:rounded-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <BrandMark size={62} className="w-full justify-center" />
          <button className="text-ink-300 md:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''} min-h-11`}
                onClick={onClose}
              >
                <item.icon size={18} />
                {item.label}
                {item.adminOnly && (
                  <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink-300">
                    Admin
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <p className="px-3 pt-4 text-[10px] text-ink-400">v0.1 - internal scaffold</p>
      </aside>
    </>
  )
}
