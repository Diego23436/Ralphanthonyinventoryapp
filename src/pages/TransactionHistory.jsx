import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import useInventorySnapshot from '../hooks/useInventorySnapshot'

export default function TransactionHistory() {
  const { t } = useTranslation()
  const { snapshot, loading, error, refresh } = useInventorySnapshot()
  const [typeFilter, setTypeFilter] = useState('all')

  const rows = useMemo(() => {
    const transactions = snapshot?.transactions ?? []
    return transactions.filter((row) => typeFilter === 'all' || row.type === typeFilter)
  }, [snapshot?.transactions, typeFilter])

  function exportPdf() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Transaction History', 14, 16)
    autoTable(doc, {
      startY: 22,
      head: [['Date', 'Operation', 'Material', 'Quantity', 'Performed by', 'Location']],
      body: rows.map((row) => [
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
      rows.map((row) => ({
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">Audit trail</p>
          <h1 className="mt-2 text-2xl font-bold">{t('history.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            Every stock move is appended, never edited. Export the filtered view for reports or archiving.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refresh} className="btn-secondary !px-3 !py-2 text-xs">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportPdf} className="btn-secondary !px-3 !py-2 text-xs">
            <Download size={14} /> PDF
          </button>
          <button onClick={exportExcel} className="btn-secondary !px-3 !py-2 text-xs">
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'Stock In', 'Stock Out'].map((option) => (
          <button
            key={option}
            onClick={() => setTypeFilter(option)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              typeFilter === option
                ? 'border-clay-500 bg-clay-500 text-white'
                : 'border-ink-200 text-ink-500 hover:bg-ink-50 dark:border-ink-600 dark:hover:bg-ink-700'
            }`}
          >
            {option === 'all' ? 'All' : option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-ink-100 bg-white/80 p-5 text-sm text-ink-500 shadow-sm dark:border-ink-700 dark:bg-ink-900/60">
          Loading transaction history...
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-status-low/20 bg-status-low/5 p-4 text-sm text-status-low">
          {error.message}
        </div>
      )}

      <div className="card overflow-hidden md:hidden">
        <div className="divide-y divide-ink-50 dark:divide-ink-800">
          {rows.map((row) => (
            <div key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">{row.material}</p>
                  <p className="mt-1 text-xs text-ink-400">{row.date_label ?? row.date}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    row.type === 'Stock In'
                      ? 'bg-status-healthy/10 text-status-healthy'
                      : 'bg-clay-500/10 text-clay-600'
                  }`}
                >
                  {row.type}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-ink-50 p-3 dark:bg-ink-800/60">
                  <p className="text-[11px] uppercase tracking-wide text-ink-400">Quantity</p>
                  <p className="mt-1 font-semibold">{row.quantity}</p>
                </div>
                <div className="rounded-2xl bg-ink-50 p-3 dark:bg-ink-800/60">
                  <p className="text-[11px] uppercase tracking-wide text-ink-400">Location</p>
                  <p className="mt-1 font-semibold">{row.location}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-500">
                <span className="font-medium text-ink-700 dark:text-ink-200">By:</span> {row.by}
              </p>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
                No transactions match the current filter.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50/80 text-xs uppercase tracking-wide text-ink-400 dark:bg-ink-800/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Operation</th>
              <th className="px-4 py-3 font-semibold">Material</th>
              <th className="px-4 py-3 font-semibold">Quantity</th>
              <th className="px-4 py-3 font-semibold">Performed by</th>
              <th className="px-4 py-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-ink-50 last:border-0 dark:border-ink-800">
                <td className="px-4 py-4 text-ink-500">{row.date_label ?? row.date}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.type === 'Stock In'
                        ? 'bg-status-healthy/10 text-status-healthy'
                        : 'bg-clay-500/10 text-clay-600'
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-4 font-medium">{row.material}</td>
                <td className="px-4 py-4">{row.quantity}</td>
                <td className="px-4 py-4 text-ink-500">{row.by}</td>
                <td className="px-4 py-4 text-ink-400">{row.location}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
                    No transactions match the current filter.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-400">
        This ledger is append-only. Corrections happen via new compensating entries, never edits or deletes.
      </p>
    </div>
  )
}
