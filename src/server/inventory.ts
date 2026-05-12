import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getStore, newId } from './store'
import {
  productInputSchema,
  productUpdateSchema,
  stockMovementInputSchema,
  supplierInputSchema,
} from '#/lib/inventory/schemas'
import type {
  DashboardMetrics,
  Product,
  StockMovement,
  Supplier,
} from '#/lib/inventory/types'

export const listProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Product[]> => {
    const store = getStore()
    return Array.from(store.products.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  },
)

export const getProduct = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<Product | null> => {
    const store = getStore()
    return store.products.get(data.id) ?? null
  })

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator(productInputSchema)
  .handler(async ({ data }): Promise<Product> => {
    const store = getStore()
    const now = new Date().toISOString()
    const product: Product = {
      id: newId('prd'),
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    store.products.set(product.id, product)
    if (product.stock > 0) {
      store.movements.unshift({
        id: newId('mov'),
        productId: product.id,
        type: 'in',
        quantity: product.stock,
        reason: 'Initial stock on product creation',
        createdAt: now,
      })
    }
    return product
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator(productUpdateSchema)
  .handler(async ({ data }): Promise<Product> => {
    const store = getStore()
    const existing = store.products.get(data.id)
    if (!existing) throw new Error(`Product not found: ${data.id}`)
    const { id, ...patch } = data
    const updated: Product = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    store.products.set(id, updated)
    return updated
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ id: string }> => {
    const store = getStore()
    store.products.delete(data.id)
    store.movements = store.movements.filter((m) => m.productId !== data.id)
    return { id: data.id }
  })

export const listMovements = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({ productId: z.string().optional(), limit: z.number().optional() })
      .optional(),
  )
  .handler(async ({ data }): Promise<StockMovement[]> => {
    const store = getStore()
    let movements = [...store.movements]
    if (data?.productId) {
      movements = movements.filter((m) => m.productId === data.productId)
    }
    movements.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (data?.limit) movements = movements.slice(0, data.limit)
    return movements
  })

export const recordMovement = createServerFn({ method: 'POST' })
  .inputValidator(stockMovementInputSchema)
  .handler(async ({ data }): Promise<StockMovement> => {
    const store = getStore()
    const product = store.products.get(data.productId)
    if (!product) throw new Error(`Product not found: ${data.productId}`)

    const delta =
      data.type === 'in'
        ? Math.abs(data.quantity)
        : data.type === 'out'
          ? -Math.abs(data.quantity)
          : data.quantity

    const newStock = product.stock + delta
    if (newStock < 0) {
      throw new Error(
        `Insufficient stock: ${product.name} has ${product.stock} units`,
      )
    }

    const now = new Date().toISOString()
    store.products.set(product.id, {
      ...product,
      stock: newStock,
      updatedAt: now,
    })

    const movement: StockMovement = {
      id: newId('mov'),
      productId: data.productId,
      type: data.type,
      quantity: delta,
      reason: data.reason,
      createdAt: now,
    }
    store.movements.unshift(movement)
    return movement
  })

export const listSuppliers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Supplier[]> => {
    const store = getStore()
    return Array.from(store.suppliers.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  },
)

export const createSupplier = createServerFn({ method: 'POST' })
  .inputValidator(supplierInputSchema)
  .handler(async ({ data }): Promise<Supplier> => {
    const store = getStore()
    const supplier: Supplier = {
      id: newId('sup'),
      ...data,
      createdAt: new Date().toISOString(),
    }
    store.suppliers.set(supplier.id, supplier)
    return supplier
  })

export const getDashboardMetrics = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardMetrics> => {
    const store = getStore()
    const products = Array.from(store.products.values())
    return {
      productCount: products.length,
      totalUnits: products.reduce((sum, p) => sum + p.stock, 0),
      inventoryValue: products.reduce(
        (sum, p) => sum + p.stock * p.costPrice,
        0,
      ),
      lowStockCount: products.filter(
        (p) => p.stock > 0 && p.stock <= p.reorderPoint,
      ).length,
      outOfStockCount: products.filter((p) => p.stock === 0).length,
    }
  },
)
