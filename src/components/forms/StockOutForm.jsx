import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import useInventorySnapshot from '../../hooks/useInventorySnapshot'
import {
  createStockIn,
  createStockOut,
  isSupabaseConfigured,
  materialDisplayCode,
} from '../../lib/inventoryApi'
import { enqueueOfflineMutation, flushOfflineQueue, getOfflineQueue } from '../../lib/offlineQueue'

export default function StockOutForm({ onSubmitted }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { snapshot } = useInventorySnapshot()
  const materials = (snapshot?.materials ?? []).filter((material) => !material.is_archived)
  const levels = snapshot?.levels ?? []
  const [form, setForm] = useState({
    material_id: '',
    level_id: '',
    quantity: '',
    is_damaged: false,
    description: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [queuedCount, setQueuedCount] = useState(getOfflineQueue().length)

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === form.material_id),
    [materials, form.material_id]
  )
  const availableQuantity = Number(selectedMaterial?.current_quantity ?? 0)
  const exceedsAvailable = Boolean(selectedMaterial) && Number(form.quantity || 0) > availableQuantity

  useEffect(() => {
    if (!form.material_id && materials.length > 0) {
      setForm((current) => ({ ...current, material_id: materials[0].id }))
    }
  }, [materials, form.material_id])

  useEffect(() => {
    if (!form.level_id && levels.length > 0) {
      setForm((current) => ({ ...current, level_id: levels[0].id }))
    }
  }, [levels, form.level_id])

  useEffect(() => {
    async function syncQueue() {
      const result = await flushOfflineQueue({
        stock_in: createStockIn,
        stock_out: createStockOut,
      })
      if (result.synced > 0) {
        setQueuedCount(getOfflineQueue().length)
      }
    }

    syncQueue()
    window.addEventListener('online', syncQueue)
    return () => window.removeEventListener('online', syncQueue)
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.material_id) {
      setError(t('stockOut.noMaterials'))
      return
    }
    if (!form.level_id) {
      setError(t('stockOut.noLevels'))
      return
    }
    if (Number(form.quantity) <= 0) {
      setError(t('common.quantityError'))
      return
    }
    if (exceedsAvailable) {
      setError(t('stockOut.insufficient', { availableQuantity }))
      return
    }

    setSubmitting(true)

    const payload = {
      material_id: form.material_id,
      level_id: form.level_id,
      quantity: Number(form.quantity),
      date: form.date,
      description: form.description.trim() || null,
      is_damaged: form.is_damaged,
      performed_by_id: user?.id,
    }

    try {
      if (!navigator.onLine || !isSupabaseConfigured) {
        enqueueOfflineMutation({ type: 'stock_out', payload })
        setQueuedCount(getOfflineQueue().length)
        setMessage(t('common.savedOffline'))
      } else {
        const { error: submitError } = await createStockOut(payload)
        if (submitError) throw submitError
        setMessage(t('stockOut.success'))
      }

      setForm((current) => ({
        ...current,
        quantity: '',
        description: '',
        is_damaged: false,
      }))
      onSubmitted?.()
    } catch (submitError) {
      setError(submitError?.message || t('common.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">{t('stockOut.material')}</label>
        <select
          className="field-input"
          value={form.material_id}
          onChange={(event) => update('material_id', event.target.value)}
          disabled={materials.length === 0}
        >
          {materials.length === 0 ? (
            <option value="">{t('common.noMaterials')}</option>
          ) : (
            materials.map((material) => (
              <option key={material.id} value={material.id}>
                {materialDisplayCode(material)} - {material.name} ({material.current_quantity} available)
              </option>
            ))
          )}
        </select>
        {materials.length === 0 && (
          <p className="mt-1 text-xs text-ink-400">{t('stockOut.createMaterialFirst')}</p>
        )}
      </div>

      <div>
        <label className="field-label">{t('stockOut.projectLevel')}</label>
        <select
          className="field-input"
          value={form.level_id}
          onChange={(event) => update('level_id', event.target.value)}
          disabled={levels.length === 0}
        >
          {levels.length === 0 ? (
    <option value="">{t('stockOut.noLevels')}</option>
          ) : (
            levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))
          )}
        </select>
        {levels.length === 0 && (
          <p className="mt-1 text-xs text-ink-400">{t('stockOut.createLevelFirst')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">{t('stockOut.quantity')}</label>
          <input
            type="number"
            min="1"
            required
            className="field-input"
            value={form.quantity}
            onChange={(event) => update('quantity', event.target.value)}
          />
          {selectedMaterial && exceedsAvailable && (
            <p className="mt-1 text-xs font-medium text-status-low">{t('stockOut.available', { availableQuantity })}</p>
          )}
        </div>
        <div>
          <label className="field-label">{t('stockOut.date')}</label>
          <input
            type="date"
            required
            className="field-input"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.is_damaged}
          onChange={(event) => update('is_damaged', event.target.checked)}
          className="h-4 w-4 rounded border-ink-300 text-clay-500 focus:ring-clay-400"
        />
        {t('stockOut.damaged')}
      </label>

      <div>
        <label className="field-label">{t('stockOut.location')}</label>
        <textarea
          rows={2}
          placeholder={t('stockOut.locationPlaceholder')}
          className="field-input resize-none"
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </div>

      <div>
        <label className="field-label">{t('stockOut.recordedBy')}</label>
        <input type="text" disabled className="field-input opacity-70" value={user?.name ?? ''} />
      </div>

      {message && (
        <p className="rounded-xl border border-status-healthy/20 bg-status-healthy/5 px-3 py-2 text-sm text-status-healthy">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
          {error}
        </p>
      )}
      {queuedCount > 0 && (
        <p className="text-xs text-ink-400">
          {t('common.offlinePending', { count: queuedCount })}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || exceedsAvailable || !form.level_id || !form.material_id}
        className="btn-primary w-full"
      >
        {submitting ? t('common.saving') : t('stockOut.submit')}
      </button>
    </form>
  )
}
