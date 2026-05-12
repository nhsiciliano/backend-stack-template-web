import type {
  Product,
  StockMovement,
  Supplier,
} from '#/lib/inventory/types'

type Store = {
  products: Map<string, Product>
  movements: StockMovement[]
  suppliers: Map<string, Supplier>
  seeded: boolean
}

const globalAny = globalThis as unknown as { __inventoryStore?: Store }

function seed(store: Store) {
  const now = new Date().toISOString()

  const suppliers: Supplier[] = [
    {
      id: 'sup_acme',
      name: 'ACME Components',
      email: 'sales@acme.example',
      phone: '+1-555-0101',
      createdAt: now,
    },
    {
      id: 'sup_nordic',
      name: 'Nordic Supply Co.',
      email: 'orders@nordic.example',
      phone: '+1-555-0202',
      createdAt: now,
    },
    {
      id: 'sup_pacific',
      name: 'Pacific Goods Ltd.',
      email: 'hello@pacific.example',
      phone: '+1-555-0303',
      createdAt: now,
    },
  ]
  for (const s of suppliers) store.suppliers.set(s.id, s)

  const products: Product[] = [
    {
      id: 'prd_001',
      sku: 'WGT-001',
      name: 'Widget Alpha',
      description: 'Standard issue widget, 12mm threaded.',
      category: 'Widgets',
      unitPrice: 9.5,
      costPrice: 4.2,
      stock: 142,
      reorderPoint: 50,
      supplierId: 'sup_acme',
      location: 'A-01-03',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prd_002',
      sku: 'WGT-002',
      name: 'Widget Beta',
      description: 'Heavy-duty widget for industrial use.',
      category: 'Widgets',
      unitPrice: 18.0,
      costPrice: 8.75,
      stock: 12,
      reorderPoint: 25,
      supplierId: 'sup_acme',
      location: 'A-01-04',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prd_003',
      sku: 'CBL-USB-C',
      name: 'USB-C Cable 2m',
      description: 'Braided USB-C cable, 100W PD rated.',
      category: 'Cables',
      unitPrice: 14.99,
      costPrice: 5.5,
      stock: 320,
      reorderPoint: 80,
      supplierId: 'sup_pacific',
      location: 'B-02-11',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prd_004',
      sku: 'BAT-18650',
      name: 'Li-Ion Battery 18650',
      description: '3500mAh protected cell.',
      category: 'Power',
      unitPrice: 7.25,
      costPrice: 3.1,
      stock: 8,
      reorderPoint: 40,
      supplierId: 'sup_nordic',
      location: 'C-04-02',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'prd_005',
      sku: 'ENC-METAL-S',
      name: 'Metal Enclosure (S)',
      description: 'Anodized aluminium enclosure, small.',
      category: 'Enclosures',
      unitPrice: 22.0,
      costPrice: 11.4,
      stock: 64,
      reorderPoint: 20,
      supplierId: 'sup_nordic',
      location: 'D-01-07',
      createdAt: now,
      updatedAt: now,
    },
  ]
  for (const p of products) store.products.set(p.id, p)

  store.movements = [
    {
      id: 'mov_0001',
      productId: 'prd_002',
      type: 'out',
      quantity: 30,
      reason: 'Customer order #4471',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'mov_0002',
      productId: 'prd_003',
      type: 'in',
      quantity: 200,
      reason: 'PO-2025-118 received',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'mov_0003',
      productId: 'prd_004',
      type: 'out',
      quantity: 12,
      reason: 'Customer order #4490',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: 'mov_0004',
      productId: 'prd_001',
      type: 'adjust',
      quantity: -3,
      reason: 'Damaged on receipt',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ]

  store.seeded = true
}

export function getStore(): Store {
  if (!globalAny.__inventoryStore) {
    const store: Store = {
      products: new Map(),
      movements: [],
      suppliers: new Map(),
      seeded: false,
    }
    seed(store)
    globalAny.__inventoryStore = store
  }
  return globalAny.__inventoryStore
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10)
  const ts = Date.now().toString(36)
  return `${prefix}_${ts}${rand}`
}
