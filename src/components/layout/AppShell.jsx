import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import useInventorySnapshot from '../../hooks/useInventorySnapshot'
import { createStockIn, createStockOut, materialStatus } from '../../lib/inventoryApi'
import { flushOfflineQueue } from '../../lib/offlineQueue'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { snapshot } = useInventorySnapshot()
  const alertCount = (snapshot?.materials ?? []).filter((material) => materialStatus(material) === 'low').length

  useEffect(() => {
    async function syncQueue() {
      await flushOfflineQueue({
        stock_in: createStockIn,
        stock_out: createStockOut,
      })
    }

    syncQueue()
    window.addEventListener('online', syncQueue)
    return () => window.removeEventListener('online', syncQueue)
  }, [])

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(160,114,58,0.08),_transparent_30%),linear-gradient(180deg,_#fbf9f6_0%,_#f5f1eb_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(160,114,58,0.12),_transparent_30%),linear-gradient(180deg,_#15171a_0%,_#111315_100%)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen w-full flex-1 flex-col overflow-x-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} alertCount={alertCount} />
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
