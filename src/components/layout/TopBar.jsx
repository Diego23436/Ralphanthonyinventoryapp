import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Menu, Sun, Moon, Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export default function TopBar({ onMenuClick, alertCount = 0 }) {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function toggleLang() {
    const next = i18n.language === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('ra_lang', next)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#eadfce] bg-[rgba(253,248,240,0.88)] px-4 backdrop-blur dark:border-[#4a3020] dark:bg-[rgba(68,44,30,0.92)] md:px-6">
      <div className="flex items-center gap-3">
        <button className="text-ink-500 md:hidden" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button onClick={toggleLang} className="rounded-full border border-[#e5d4bc] bg-white px-3 py-1.5 text-xs font-semibold text-[#7c6346] shadow-sm dark:border-[#6b4630] dark:bg-[#5a3b29] dark:text-[#f8efe3]">
          {i18n.language === 'en' ? 'FR' : 'EN'}
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-full border border-[#e5d4bc] bg-white p-2 text-[#7c6346] shadow-sm hover:bg-[#f6ede2] dark:border-[#6b4630] dark:bg-[#5a3b29] dark:text-[#f8efe3] dark:hover:bg-[#6b4630]"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          className="relative rounded-full border border-[#e5d4bc] bg-white p-2 text-[#7c6346] shadow-sm hover:bg-[#f6ede2] dark:border-[#6b4630] dark:bg-[#5a3b29] dark:text-[#f8efe3] dark:hover:bg-[#6b4630]"
          aria-label={t('nav.notifications')}
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-low px-1 text-[10px] font-bold text-white">
              {alertCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-[#e5d4bc] bg-white py-1.5 pl-2 pr-2.5 shadow-sm hover:bg-[#f6ede2] dark:border-[#6b4630] dark:bg-[#5a3b29] dark:hover:bg-[#6b4630]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-clay-500 text-xs font-bold text-white">
              {user?.name?.[0] ?? <User size={14} />}
            </div>
            <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
            <ChevronDown size={14} className="text-ink-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#eadfce] bg-white py-1 shadow-lg dark:border-[#6b4630] dark:bg-[#513525]">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-[#6d5438] hover:bg-[#f5eadc] dark:text-[#f8efe3] dark:hover:bg-[#6b4630]"
              >
                <LogOut size={15} /> {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
