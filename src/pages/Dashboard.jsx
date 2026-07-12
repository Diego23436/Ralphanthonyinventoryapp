import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Layers3,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import useInventorySnapshot from '../hooks/useInventorySnapshot'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { createLevel, createMaterial, materialStatus } from '../lib/inventoryApi'
import KpiCard from '../components/ui/KpiCard'
import StockInModal from '../components/forms/StockInModal'
import StockOutModal from '../components/forms/StockOutModal'

export default function Dashboard() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()
  const { snapshot, loading, error, refresh } = useInventorySnapshot()
  const [stockInOpen, setStockInOpen] = useState(false)
  const [stockOutOpen, setStockOutOpen] = useState(false)
  const [setupMessage, setSetupMessage] = useState('')
  const [setupError, setSetupError] = useState('')
  const [materialDraft, setMaterialDraft] = useState({
    name: '',
    description: '',
    minimum_threshold: '',
  })
  const [levelDraft, setLevelDraft] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 10),
    estimated_finish_date: '',
  })
  const [savingMaterial, setSavingMaterial] = useState(false)
  const [savingLevel, setSavingLevel] = useState(false)

  const materials = (snapshot?.materials ?? []).filter((material) => !material.is_archived)
  const levels = snapshot?.levels ?? []
  const belowThreshold = materials.filter((material) => materialStatus(material) === 'low').length
  const watchCount = materials.filter((material) => materialStatus(material) === 'watch').length
  const usageByDay = snapshot?.usageByDay ?? []
  const recentActivity = snapshot?.recentActivity ?? []
  const transactions = snapshot?.transactions ?? []
  const setupNeeded = materials.length === 0 || levels.length === 0

  function exportPdf() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Transaction History', 14, 16)
    autoTable(doc, {
      startY: 22,
      head: [['Date', 'Operation', 'Material', 'Quantity', 'Performed by', 'Location']],
      body: transactions.map((row) => [
        row.date_label ?? row.date,
        row.type,
        row.material,
        String(row.quantity),
        row.by,
        row.location,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [160, 114, 58] },
    })
    doc.save('transaction-history.pdf')
  }

  function exportExcel() {
    const sheet = XLSX.utils.json_to_sheet(
      transactions.map((row) => ({
        Date: row.date_label ?? row.date,
        Operation: row.type,
        Material: row.material,
        Quantity: row.quantity,
        'Performed by': row.by,
        Location: row.location,
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions')
    XLSX.writeFile(workbook, 'transaction-history.xlsx')
  }

  async function handleMaterialSetup(event) {
    event.preventDefault()
    setSetupMessage('')
    setSetupError('')
    setSavingMaterial(true)
    const formData = new FormData(event.currentTarget)
    const { error: submitError } = await createMaterial({
      name: formData.get('name'),
      description: formData.get('description'),
      minimum_threshold: formData.get('minimum_threshold'),
    })
    if (submitError) setSetupError(submitError.message)
    else {
      setSetupMessage('Material created successfully.')
      setMaterialDraft({ name: '', description: '', minimum_threshold: '' })
      event.currentTarget.reset()
      refresh()
    }
    setSavingMaterial(false)
  }

  async function handleLevelSetup(event) {
    event.preventDefault()
    setSetupMessage('')
    setSetupError('')
    setSavingLevel(true)
    const formData = new FormData(event.currentTarget)
    const { error: submitError } = await createLevel({
      name: formData.get('name'),
      description: formData.get('description'),
      start_date: formData.get('start_date'),
      estimated_finish_date: formData.get('estimated_finish_date'),
    })
    if (submitError) setSetupError(submitError.message)
    else {
      setSetupMessage('Work level created successfully.')
      setLevelDraft({
        name: '',
        description: '',
        start_date: new Date().toISOString().slice(0, 10),
        estimated_finish_date: '',
      })
      event.currentTarget.reset()
      refresh()
    }
    setSavingLevel(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">Operations overview</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{t('dashboard.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Live inventory, low-stock signals, and recent activity update across connected devices in real time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <button onClick={exportPdf} className="btn-secondary !px-3 !py-2 text-xs">
                <Download size={14} /> PDF
              </button>
              <button onClick={exportExcel} className="btn-secondary !px-3 !py-2 text-xs">
                <FileSpreadsheet size={14} /> Excel
              </button>
            </>
          )}
          <button onClick={refresh} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {setupNeeded && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={handleMaterialSetup} className="card space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Layers3 size={18} className="text-clay-500" />
              <h2 className="text-sm font-semibold text-ink-500">Initialize materials</h2>
            </div>
            <div>
              <label className="field-label">Material name</label>
              <input
                name="name"
                required
                className="field-input"
                value={materialDraft.name}
                onChange={(event) => setMaterialDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Cement 50kg"
              />
            </div>
            <div>
              <label className="field-label">Description</label>
              <input
                name="description"
                className="field-input"
                value={materialDraft.description}
                onChange={(event) => setMaterialDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Optional notes"
              />
            </div>
            <div>
              <label className="field-label">Minimum threshold</label>
              <input
                name="minimum_threshold"
                type="number"
                min="0"
                required
                className="field-input"
                value={materialDraft.minimum_threshold}
                onChange={(event) =>
                  setMaterialDraft((current) => ({ ...current, minimum_threshold: event.target.value }))
                }
              />
            </div>
            <button type="submit" disabled={savingMaterial} className="btn-primary w-full">
              {savingMaterial ? 'Saving...' : 'Create material'}
            </button>
          </form>

          <form onSubmit={handleLevelSetup} className="card space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Layers3 size={18} className="text-clay-500" />
              <h2 className="text-sm font-semibold text-ink-500">Initialize work levels</h2>
            </div>
            <div>
              <label className="field-label">Level name</label>
              <input
                name="name"
                required
                className="field-input"
                value={levelDraft.name}
                onChange={(event) => setLevelDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Level 1 - Slab"
              />
            </div>
            <div>
              <label className="field-label">Description</label>
              <input
                name="description"
                className="field-input"
                value={levelDraft.description}
                onChange={(event) => setLevelDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Optional zone or work package"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Start date</label>
                <input
                  name="start_date"
                  type="date"
                  required
                  className="field-input"
                  value={levelDraft.start_date}
                  onChange={(event) => setLevelDraft((current) => ({ ...current, start_date: event.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">Finish date</label>
                <input
                  name="estimated_finish_date"
                  type="date"
                  className="field-input"
                  value={levelDraft.estimated_finish_date}
                  onChange={(event) =>
                    setLevelDraft((current) => ({ ...current, estimated_finish_date: event.target.value }))
                  }
                />
              </div>
            </div>
            <button type="submit" disabled={savingLevel} className="btn-primary w-full">
              {savingLevel ? 'Saving...' : 'Create work level'}
            </button>
          </form>
        </div>
      )}

      {setupMessage && (
        <p className="rounded-xl border border-status-healthy/20 bg-status-healthy/5 px-3 py-2 text-sm text-status-healthy">
          {setupMessage}
        </p>
      )}
      {setupError && (
        <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
          {setupError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('dashboard.materialsTracked')} value={materials.length} icon={Boxes} />
        <KpiCard label={t('dashboard.belowThreshold')} value={belowThreshold} icon={AlertTriangle} accent="text-status-low" />
        <KpiCard
          label={t('dashboard.stockInToday')}
          value={(snapshot?.transactions ?? []).filter(
            (row) => row.type === 'Stock In' && row.date === new Date().toISOString().slice(0, 10)
          ).length}
          icon={ArrowDownToLine}
          accent="text-status-healthy"
        />
        <KpiCard
          label={t('dashboard.stockOutToday')}
          value={(snapshot?.transactions ?? []).filter(
            (row) => row.type === 'Stock Out' && row.date === new Date().toISOString().slice(0, 10)
          ).length}
          icon={ArrowUpFromLine}
          accent="text-clay-500"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => setStockInOpen(true)} className="btn-primary">
          {t('dashboard.newDelivery')}
        </button>
        <button onClick={() => setStockOutOpen(true)} className="btn-secondary">
          {t('dashboard.recordUsage')}
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-ink-100 bg-white/80 p-5 text-sm text-ink-500 shadow-sm dark:border-ink-700 dark:bg-ink-900/60">
          Loading live inventory snapshot...
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-status-low/20 bg-status-low/5 p-4 text-sm text-status-low">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink-500">{t('dashboard.usageChart')}</h2>
              <p className="text-xs text-ink-400">Seven-day stock-out volume</p>
            </div>
            <span className="rounded-full bg-clay-50 px-3 py-1 text-xs font-semibold text-clay-700 dark:bg-ink-700 dark:text-clay-200">
              {watchCount} watching
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usageByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-ink-100 dark:text-ink-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="currentColor" className="text-ink-400" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-ink-400" />
              <Tooltip
                contentStyle={{ borderRadius: 16, border: '1px solid #E4E6E8', fontSize: 13 }}
                cursor={{ fill: 'rgba(160,114,58,0.08)' }}
              />
              <Bar dataKey="usage" fill="#A0723A" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink-500">{t('dashboard.recentActivity')}</h2>
          {recentActivity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
              Activity will appear here once stock moves are recorded.
            </div>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 rounded-2xl bg-ink-50/70 p-3 dark:bg-ink-800/60">
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      activity.type === 'stock_in' ? 'bg-status-healthy' : 'bg-clay-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === 'stock_in' ? 'Stock In' : 'Stock Out'} - {activity.material} ({activity.quantity})
                    </p>
                    <p className="text-xs text-ink-400">{activity.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="card space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink-500">Admin exports</h2>
              <p className="text-xs text-ink-400">Export the full transaction ledger directly from the dashboard.</p>
            </div>
            <span className="rounded-full bg-clay-50 px-3 py-1 text-xs font-semibold text-clay-700 dark:bg-ink-700 dark:text-clay-200">
              {transactions.length} transactions
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportPdf} className="btn-secondary !px-3 !py-2 text-xs">
              <Download size={14} /> PDF
            </button>
            <button onClick={exportExcel} className="btn-secondary !px-3 !py-2 text-xs">
              <FileSpreadsheet size={14} /> Excel
            </button>
          </div>
        </div>
      )}

      {isAdmin && belowThreshold > 0 && (
        <div className="card flex flex-col gap-3 border-status-low/30 bg-status-low/5 p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="text-status-low" size={20} />
          <p className="text-sm">
            <strong>{belowThreshold} material(s)</strong> are at or below their configured threshold.{' '}
            <a href="/materials" className="font-semibold text-status-low underline underline-offset-2">
              Review now
            </a>
          </p>
        </div>
      )}

      <StockInModal open={stockInOpen} onClose={() => setStockInOpen(false)} />
      <StockOutModal open={stockOutOpen} onClose={() => setStockOutOpen(false)} />
    </div>
  )
}
