export const mockMaterials = [
  { id: 'MAT-001', name: 'Cement 50kg', description: 'Portland cement, 50kg bag', current_quantity: 120, minimum_threshold: 40 },
  { id: 'MAT-002', name: 'Iron rod 12mm', description: 'Reinforcement bar, 12mm x 6m', current_quantity: 58, minimum_threshold: 60 },
  { id: 'MAT-003', name: 'Paint (white bucket)', description: '20L emulsion paint', current_quantity: 18, minimum_threshold: 20 },
  { id: 'MAT-004', name: 'Blocks (15cm)', description: 'Hollow concrete blocks', current_quantity: 640, minimum_threshold: 200 },
  { id: 'MAT-005', name: 'Sand (m3)', description: 'River sand, per cubic metre', current_quantity: 12, minimum_threshold: 15 },
  { id: 'MAT-006', name: 'Roofing sheets', description: 'Galvanized iron sheet, 3m', current_quantity: 84, minimum_threshold: 30 },
]

export function materialStatus(material) {
  const { current_quantity, minimum_threshold } = material
  if (current_quantity <= minimum_threshold) return 'low'
  if (current_quantity <= minimum_threshold * 1.2) return 'watch'
  return 'healthy'
}

export const mockRecentActivity = [
  { id: 1, type: 'stock_out', material: 'Cement 50kg', quantity: 4, when: 'Today, 10:24' },
  { id: 2, type: 'stock_in', material: 'Iron rod 12mm', quantity: 100, when: 'Today, 09:10' },
  { id: 3, type: 'stock_out', material: 'Paint (white bucket)', quantity: 5, when: 'Yesterday, 16:40' },
  { id: 4, type: 'stock_in', material: 'Blocks (15cm)', quantity: 200, when: 'Yesterday, 08:55' },
]

export const mockUsageByDay = [
  { day: 'Mon', usage: 32 },
  { day: 'Tue', usage: 48 },
  { day: 'Wed', usage: 24 },
  { day: 'Thu', usage: 61 },
  { day: 'Fri', usage: 52 },
  { day: 'Sat', usage: 38 },
  { day: 'Sun', usage: 19 },
]

export const mockTransactions = [
  { id: 't1', date: '2026-07-10', type: 'Stock In', material: 'Iron rod 12mm', quantity: 100, by: 'J. Mballa', location: 'Site warehouse' },
  { id: 't2', date: '2026-07-10', type: 'Stock Out', material: 'Cement 50kg', quantity: 4, by: 'A. Ngu', location: 'Level 3 - Column pour' },
  { id: 't3', date: '2026-07-09', type: 'Stock Out', material: 'Paint (white bucket)', quantity: 5, by: 'A. Ngu', location: 'Level 4 - Living room' },
  { id: 't4', date: '2026-07-09', type: 'Stock In', material: 'Blocks (15cm)', quantity: 200, by: 'J. Mballa', location: 'Site warehouse' },
  { id: 't5', date: '2026-07-08', type: 'Stock Out', material: 'Sand (m3)', quantity: 3, by: 'J. Mballa', location: 'Level 2 - Screeding' },
]

