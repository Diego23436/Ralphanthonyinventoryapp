import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import useInventorySnapshot from '../../hooks/useInventorySnapshot'
import { createStockIn, createStockOut, isSupabaseConfigured, materialDisplayCode } from '../../lib/inventoryApi'
import { enqueueOfflineMutation, flushOfflineQueue, getOfflineQueue } from '../../lib/offlineQueue'

export default function StockInForm({ onSubmitted }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { snapshot } = useInventorySnapshot()
  const materials = (snapshot?.materials ?? []).filter((material) => !material.is_archived)
  const isStorekeeper = user?.role === 'storekeeper'
  const [form, setForm] = useState({
    material_id: '',
    quantity: '',
    delivery_date: new Date().toISOString().slice(0, 10),
    delivered_by: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [queuedCount, setQueuedCount] = useState(getOfflineQueue().length)

  useEffect(() => {
    if (!form.material_id && materials.length > 0) {
      setForm((current) => ({ ...current, material_id: materials[0].id }))
    }
  }, [materials, form.material_id])

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

    if (!isStorekeeper) {
      setError('Stock entries are recorded by storekeeper accounts only.')
      return
    }

    if (!form.material_id) {
      setError('Create at least one material before recording stock in.')
      return
    }

    if (Number(form.quantity) <= 0) {
      setError('Quantity must be greater than zero.')
      return
    }

    setSubmitting(true)

    const payload = {
      material_id: form.material_id,
      quantity: Number(form.quantity),
      delivery_date: form.delivery_date,
      delivered_by: form.delivered_by.trim() || 'Unknown supplier',
      received_by_id: user?.id,
    }

    try {
      if (!navigator.onLine || !isSupabaseConfigured) {
        enqueueOfflineMutation({ type: 'stock_in', payload })
        setQueuedCount(getOfflineQueue().length)
        setMessage('Saved offline. It will sync automatically once the connection returns.')
      } else {
        const { error: submitError } = await createStockIn(payload)
        if (submitError) throw submitError
        setMessage('Stock in recorded successfully.')
      }

      setForm((current) => ({
        ...current,
        quantity: '',
        delivered_by: '',
      }))
      onSubmitted?.()
    } catch (submitError) {
      setError(submitError?.message || 'Unable to submit stock in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label">{t('stockIn.material')}</label>
        <select
          className="field-input"
          value={form.material_id}
          onChange={(event) => update('material_id', event.target.value)}
          disabled={materials.length === 0}
        >
          {materials.length === 0 ? (
            <option value="">No materials available</option>
          ) : (
            materials.map((material) => (
              <option key={material.id} value={material.id}>
                {materialDisplayCode(material)} - {material.name}
              </option>
            ))
          )}
        </select>
        {materials.length === 0 && (
          <p className="mt-1 text-xs text-ink-400">Create at least one material first so stock can be recorded.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">{t('stockIn.quantity')}</label>
          <input
            type="number"
            min="1"
            required
            className="field-input"
            value={form.quantity}
            onChange={(event) => update('quantity', event.target.value)}
          />
        </div>
        <div>
          <label className="field-label">{t('stockIn.date')}</label>
          <input
            type="date"
            required
            className="field-input"
            value={form.delivery_date}
            onChange={(event) => update('delivery_date', event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label">{t('stockIn.deliveredBy')}</label>
        <input
          type="text"
          placeholder="Supplier or courier name"
          className="field-input"
          value={form.delivered_by}
          onChange={(event) => update('delivered_by', event.target.value)}
        />
      </div>

      <div>
        <label className="field-label">{t('stockIn.receivedBy')}</label>
        <input type="text" disabled className="field-input opacity-70" value={user?.name ?? ''} />
      </div>

      {!isStorekeeper && (
        <p className="rounded-xl border border-status-low/20 bg-status-low/5 px-3 py-2 text-sm text-status-low">
          You are signed in as an admin. Switch to a storekeeper account to submit stock entries.
        </p>
      )}

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
          {queuedCount} offline submission{queuedCount === 1 ? '' : 's'} pending sync.
        </p>
      )}

      <button type="submit" disabled={submitting || !form.material_id || !isStorekeeper} className="btn-primary w-full">
        {submitting ? 'Saving...' : t('stockIn.submit')}
      </button>
    </form>
  )
}
