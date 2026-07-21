import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Archive, RefreshCw } from 'lucide-react'
import useInventorySnapshot from '../hooks/useInventorySnapshot'
import { createMaterial, materialDisplayCode, materialStatus } from '../lib/inventoryApi'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'

export default function MaterialManagement() {
  const { t } = useTranslation()
  const { snapshot, loading, error, refresh } = useInventorySnapshot()
  const [query, setQuery] = useState('')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const materials = snapshot?.materials ?? []
  const filtered = useMemo(
    () => materials.filter((material) => material.name.toLowerCase().includes(query.toLowerCase())),
    [materials, query]
  )

  async function handleRegister(event) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      minimum_threshold: formData.get('minimum_threshold'),
    }

    try {
      const { error: submitError } = await createMaterial(payload)
      if (submitError) throw submitError
      setRegisterOpen(false)
      event.currentTarget.reset()
    } catch (submitError) {
      setFormError(submitError?.message || t('materials.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-ink-700 dark:bg-ink-900/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-500">{t('materials.catalog')}</p>
          <h1 className="mt-2 text-2xl font-bold">{t('materials.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500 dark:text-ink-300">
            {t('materials.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-secondary">
            <RefreshCw size={16} /> {t('common.refresh')}
          </button>
          <button onClick={() => setRegisterOpen(true)} className="btn-primary">
            <Plus size={16} /> {t('materials.registerNew')}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
        <input
          className="field-input pl-9"
          placeholder={t('materials.search')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading && (
        <div className="rounded-2xl border border-ink-100 bg-white/80 p-5 text-sm text-ink-500 shadow-sm dark:border-ink-700 dark:bg-ink-900/60">
          {t('materials.loading')}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-status-low/20 bg-status-low/5 p-4 text-sm text-status-low">
          {error.message}
        </div>
      )}

      <div className="card overflow-hidden md:hidden">
        <div className="divide-y divide-ink-50 dark:divide-ink-800">
          {filtered.map((material) => {
            const status = materialStatus(material)
            return (
              <div key={material.id} className={`p-4 ${status === 'low' ? 'bg-status-low/5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{material.name}</p>
                    <p className="mt-1 text-xs text-ink-400">{materialDisplayCode(material)}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <p className="mt-3 text-sm text-ink-500 dark:text-ink-300">{material.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-ink-50 p-3 dark:bg-ink-800/60">
                    <p className="text-[11px] uppercase tracking-wide text-ink-400">Quantity</p>
                    <p className="mt-1 font-semibold">{material.current_quantity}</p>
                  </div>
                  <div className="rounded-2xl bg-ink-50 p-3 dark:bg-ink-800/60">
                    <p className="text-[11px] uppercase tracking-wide text-ink-400">Threshold</p>
                    <p className="mt-1 font-semibold">{material.minimum_threshold}</p>
                  </div>
                </div>
                <button className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-status-low">
                  <Archive size={13} /> {t('materials.archive')}
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
                {t('materials.noMatch', { query })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-50/80 text-xs uppercase tracking-wide text-ink-400 dark:bg-ink-800/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">{t('materials.name')}</th>
              <th className="px-4 py-3 font-semibold">{t('materials.quantity')}</th>
              <th className="px-4 py-3 font-semibold">{t('materials.threshold')}</th>
              <th className="px-4 py-3 font-semibold">{t('materials.status')}</th>
              <th className="px-4 py-3 font-semibold text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((material) => {
              const status = materialStatus(material)
              return (
                <tr
                  key={material.id}
                  className={`border-b border-ink-50 last:border-0 dark:border-ink-800 ${
                    status === 'low' ? 'bg-status-low/5' : ''
                  }`}
                >
                  <td className="px-4 py-4 font-mono text-xs text-ink-400">{materialDisplayCode(material)}</td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{material.name}</p>
                    <p className="text-xs text-ink-400">{material.description}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold">{material.current_quantity}</td>
                  <td className="px-4 py-4 text-ink-500">{material.minimum_threshold}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-status-low">
                      <Archive size={13} /> {t('materials.archive')}
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-ink-200 p-6 text-sm text-ink-400 dark:border-ink-700">
                    {t('materials.noMatch', { query })}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title={t('materials.registerNew')}>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="field-label">{t('materials.name')}</label>
            <input name="name" required className="field-input" placeholder="e.g. Cement 50kg" />
          </div>
          <div>
            <label className="field-label">{t('materials.description')}</label>
            <input name="description" className="field-input" placeholder="Optional notes / specification" />
          </div>
          <div>
            <label className="field-label">{t('materials.threshold')}</label>
            <input name="minimum_threshold" type="number" min="0" required className="field-input" />
          </div>

          {formError && (
            <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
              {formError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t('common.saving') : t('materials.registerNew')}
          </button>
        </form>
      </Modal>
    </div>
  )
}
