import { queryOptions } from '@tanstack/react-query'
import {
  getDashboardMetrics,
  getProduct,
  listMovements,
  listProducts,
  listSuppliers,
} from '#/server/inventory'

export const inventoryKeys = {
  all: ['inventory'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
  product: (id: string) => [...inventoryKeys.all, 'product', id] as const,
  movements: (productId?: string) =>
    [...inventoryKeys.all, 'movements', productId ?? 'all'] as const,
  suppliers: () => [...inventoryKeys.all, 'suppliers'] as const,
  dashboard: () => [...inventoryKeys.all, 'dashboard'] as const,
}

export const productsQuery = () =>
  queryOptions({
    queryKey: inventoryKeys.products(),
    queryFn: () => listProducts(),
  })

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: inventoryKeys.product(id),
    queryFn: () => getProduct({ data: { id } }),
  })

export const movementsQuery = (productId?: string, limit?: number) =>
  queryOptions({
    queryKey: inventoryKeys.movements(productId),
    queryFn: () =>
      listMovements({
        data: productId || limit ? { productId, limit } : undefined,
      }),
  })

export const suppliersQuery = () =>
  queryOptions({
    queryKey: inventoryKeys.suppliers(),
    queryFn: () => listSuppliers(),
  })

export const dashboardQuery = () =>
  queryOptions({
    queryKey: inventoryKeys.dashboard(),
    queryFn: () => getDashboardMetrics(),
  })
