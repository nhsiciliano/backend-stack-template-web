import type { Product } from '#/lib/inventory/types'

export type StockStatus = 'ok' | 'low' | 'out'

export function getStockStatus(p: Pick<Product, 'stock' | 'reorderPoint'>): StockStatus {
  if (p.stock === 0) return 'out'
  if (p.stock <= p.reorderPoint) return 'low'
  return 'ok'
}

const STYLES: Record<StockStatus, string> = {
  ok: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  low: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  out: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
}

const LABELS: Record<StockStatus, string> = {
  ok: 'In stock',
  low: 'Low stock',
  out: 'Out of stock',
}

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  )
}
