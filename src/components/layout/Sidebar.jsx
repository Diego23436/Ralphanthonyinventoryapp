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
import BrandMark from '../logo/BrandMark'

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/materials', label: t('nav.materials'), icon: Boxes },
    { to: '/stock-in', label: t('nav.stockIn'), icon: ArrowDownToLine },
    { to: '/stock-out', label: t('nav.stockOut'), icon: ArrowUpFromLine },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[85vw] max-w-xs flex-col overflow-hidden border-r border-[#eadfce] bg-[#f7efe3] px-4 py-5 text-[#6d5438] transition-transform duration-300 dark:border-[#4a3020] dark:bg-[#4f3625] dark:text-[#f5e9db] md:static md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:rounded-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-3 rounded-[1.4rem] bg-white/70 px-3 py-3 shadow-sm dark:bg-white/10">
          <BrandMark size={62} className="w-full justify-start" />
          <button className="text-[#8b6a48] md:hidden dark:text-[#f5e9db]" onClick={onClose} aria-label={t('common.closeMenu')}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#e5cfb1] text-[#5b3d22] shadow-sm dark:bg-[#76513a] dark:text-[#fff8ef]'
                      : 'text-[#7c6346] hover:bg-white/60 hover:text-[#5b3d22] dark:text-[#f0dfcc] dark:hover:bg-white/10'
                  }`
                }
                onClick={onClose}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <p className="px-3 pt-4 text-[10px] text-[#a27d57] dark:text-[#f0dfcc]/80">v0.1 - internal scaffold</p>
      </aside>
    </>
  )
}
