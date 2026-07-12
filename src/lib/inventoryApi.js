import { supabase } from './supabaseClient'
import {
  mockMaterials,
  mockRecentActivity,
  mockTransactions,
  mockUsageByDay,
} from './mockData'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

export function materialStatus(material) {
  const currentQuantity = Number(material.current_quantity ?? material.currentQuantity ?? 0)
  const minimumThreshold = Number(material.minimum_threshold ?? material.minimumThreshold ?? 0)
  if (currentQuantity <= minimumThreshold) return 'low'
  if (currentQuantity <= minimumThreshold * 1.2) return 'watch'
  return 'healthy'
}

function normalizeMaterial(row) {
  return {
    id: row.id,
    code: row.short_code ?? row.id,
    name: row.name,
    description: row.description ?? '',
    current_quantity: Number(row.current_quantity ?? 0),
    minimum_threshold: Number(row.minimum_threshold ?? 0),
    is_archived: Boolean(row.is_archived),
    created_at: row.created_at ?? null,
  }
}

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    created_at: row.created_at ?? null,
  }
}

function normalizeLevel(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    start_date: row.start_date,
    estimated_finish_date: row.estimated_finish_date ?? null,
  }
}

export function buildUsageByDay(transactions, days = 7) {
  const today = new Date()
  const dayKeys = Array.from({ length: days }, (_value, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))
    return date.toISOString().slice(0, 10)
  })

  const totals = Object.fromEntries(dayKeys.map((day) => [day, 0]))
  transactions
    .filter((transaction) => transaction.type === 'Stock Out')
    .forEach((transaction) => {
      const day = transaction.date
      if (day in totals) totals[day] += Number(transaction.quantity ?? 0)
    })

  return dayKeys.map((day) => ({
    day: new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
    usage: totals[day],
  }))
}

function buildRecentActivity(transactions) {
  return transactions.slice(0, 4).map((transaction) => ({
    id: transaction.id,
    type: transaction.type === 'Stock In' ? 'stock_in' : 'stock_out',
    material: transaction.material,
    quantity: transaction.quantity,
    when: transaction.date_label,
  }))
}

function buildTransactionRows(stockInRows, stockOutRows, materialMap, userMap, levelMap) {
  const rows = [
    ...stockInRows.map((row) => ({
      id: row.id,
      date: row.delivery_date,
      timestamp: row.created_at ?? row.delivery_date,
      date_label: new Date(row.created_at ?? row.delivery_date).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      type: 'Stock In',
      material: materialMap.get(row.material_id)?.name ?? row.material_id,
      quantity: Number(row.quantity ?? 0),
      by: userMap.get(row.received_by_id)?.name ?? row.received_by_id,
      location: row.delivered_by || 'Supplier delivery',
      material_id: row.material_id,
      level_id: null,
    })),
    ...stockOutRows.map((row) => ({
      id: row.id,
      date: row.date,
      timestamp: row.created_at ?? row.date,
      date_label: new Date(row.created_at ?? row.date).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      type: 'Stock Out',
      material: materialMap.get(row.material_id)?.name ?? row.material_id,
      quantity: Number(row.quantity ?? 0),
      by: userMap.get(row.performed_by_id)?.name ?? row.performed_by_id,
      location:
        levelMap.get(row.level_id)?.name ??
        row.description ??
        'Site movement',
      material_id: row.material_id,
      level_id: row.level_id,
    })),
  ]

  return rows.sort((left, right) => {
    const leftDate = new Date(left.timestamp ?? left.date).getTime()
    const rightDate = new Date(right.timestamp ?? right.date).getTime()
    return rightDate - leftDate
  })
}

export async function fetchInventorySnapshot() {
  if (!isSupabaseConfigured) {
    const transactions = mockTransactions.map((row) => ({
      ...row,
      date_label: row.date,
      level_id: null,
      material_id: row.material,
    }))
    return {
      materials: mockMaterials.map((material) => ({
        ...material,
        code: material.id,
        is_archived: false,
      })),
      levels: [],
      users: [],
      transactions,
      recentActivity: mockRecentActivity,
      usageByDay: mockUsageByDay,
      notifications: [],
    }
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData?.session) {
    throw new Error('Please sign in with a real Supabase account to view live inventory activity.')
  }

  const [materialsResult, stockInResult, stockOutResult, usersResult, levelsResult, notificationsResult] =
    await Promise.all([
      supabase.from('materials').select('*').order('name', { ascending: true }),
      supabase.from('stock_in').select('*').order('created_at', { ascending: false }),
      supabase.from('stock_out').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('id, name, role, created_at').order('name', { ascending: true }),
      supabase.from('levels').select('*').order('start_date', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100),
    ])

  if (materialsResult.error) throw materialsResult.error
  if (stockInResult.error) throw stockInResult.error
  if (stockOutResult.error) throw stockOutResult.error

  const materials = (materialsResult.data ?? []).map(normalizeMaterial)
  const users = usersResult.error ? [] : (usersResult.data ?? []).map(normalizeUser)
  const levels = levelsResult.error ? [] : (levelsResult.data ?? []).map(normalizeLevel)
  const notifications = notificationsResult.error ? [] : notificationsResult.data ?? []

  const materialMap = new Map(materials.map((material) => [material.id, material]))
  const userMap = new Map(users.map((user) => [user.id, user]))
  const levelMap = new Map(levels.map((level) => [level.id, level]))

  const transactions = buildTransactionRows(
    stockInResult.data ?? [],
    stockOutResult.data ?? [],
    materialMap,
    userMap,
    levelMap
  )

  return {
    materials,
    levels,
    users,
    transactions,
    recentActivity: buildRecentActivity(transactions),
    usageByDay: buildUsageByDay(transactions),
    notifications,
  }
}

export async function fetchMaterials() {
  const snapshot = await fetchInventorySnapshot()
  return snapshot.materials
}

export async function fetchLevels() {
  const snapshot = await fetchInventorySnapshot()
  return snapshot.levels
}

export async function fetchTransactions() {
  const snapshot = await fetchInventorySnapshot()
  return snapshot.transactions
}

export async function createMaterial({ name, description, minimum_threshold }) {
  const payload = {
    name: name.trim(),
    description: description?.trim() || null,
    minimum_threshold: Number(minimum_threshold ?? 0),
  }

  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.from('materials').insert(payload)
}

export async function createLevel({ name, description, start_date, estimated_finish_date }) {
  const payload = {
    name: name.trim(),
    description: description?.trim() || null,
    start_date,
    estimated_finish_date: estimated_finish_date || null,
  }

  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.from('levels').insert(payload)
}

export async function createStockIn(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.from('stock_in').insert(payload)
}

export async function createStockOut(payload) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.from('stock_out').insert(payload)
}

export function subscribeToInventory(onChange, channelName = 'inventory-live') {
  if (!isSupabaseConfigured) return () => {}

  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_in' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_out' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'levels' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, onChange)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export async function fetchNotificationRows() {
  const snapshot = await fetchInventorySnapshot()
  return snapshot.notifications
}

export async function markNotificationRead(notificationId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  return supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
}

export function materialDisplayCode(material) {
  return material.code ?? material.short_code ?? material.id
}
