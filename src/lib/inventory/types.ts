export type Supplier = {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

export type Product = {
  id: string
  sku: string
  name: string
  description: string
  category: string
  unitPrice: number
  costPrice: number
  stock: number
  reorderPoint: number
  supplierId: string | null
  location: string
  createdAt: string
  updatedAt: string
}

export type StockMovementType = 'in' | 'out' | 'adjust'

export type StockMovement = {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  reason: string
  createdAt: string
}

export type DashboardMetrics = {
  productCount: number
  totalUnits: number
  inventoryValue: number
  lowStockCount: number
  outOfStockCount: number
}
