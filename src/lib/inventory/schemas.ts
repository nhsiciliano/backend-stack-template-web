import { z } from 'zod'

export const productInputSchema = z.object({
  sku: z.string().min(2).max(40),
  name: z.string().min(2).max(120),
  description: z.string().max(500).default(''),
  category: z.string().min(1).max(60),
  unitPrice: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  reorderPoint: z.number().int().nonnegative(),
  supplierId: z.string().min(1).nullable(),
  location: z.string().max(60).default(''),
})

export type ProductInput = z.infer<typeof productInputSchema>

export const productUpdateSchema = productInputSchema.partial().extend({
  id: z.string().min(1),
})

export const stockMovementInputSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['in', 'out', 'adjust']),
  quantity: z.number().int(),
  reason: z.string().min(1).max(200),
})

export type StockMovementInput = z.infer<typeof stockMovementInputSchema>

export const supplierInputSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).default(''),
})

export type SupplierInput = z.infer<typeof supplierInputSchema>
