import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  inventoryKeys,
  movementsQuery,
  productQuery,
  suppliersQuery,
} from '#/lib/inventory/queries'
import {
  deleteProduct,
  recordMovement,
  updateProduct,
} from '#/server/inventory'
import { getStockStatus, StockBadge } from '#/components/inventory/StockBadge'
import { ProductForm } from '#/components/inventory/ProductForm'
import { stockMovementInputSchema } from '#/lib/inventory/schemas'
import type { StockMovementType } from '#/lib/inventory/types'

export const Route = createFileRoute('/products/$id')({
  component: ProductDetail,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.id)),
      context.queryClient.ensureQueryData(movementsQuery(params.id)),
      context.queryClient.ensureQueryData(suppliersQuery()),
    ])
  },
})

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const dateFmt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function ProductDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: product } = useSuspenseQuery(productQuery(id))
  const { data: movements } = useSuspenseQuery(movementsQuery(id))
  const { data: suppliers } = useSuspenseQuery(suppliersQuery())

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: inventoryKeys.all })

  const update = useMutation({
    mutationFn: (data: Parameters<typeof updateProduct>[0]['data']) =>
      updateProduct({ data }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: () => deleteProduct({ data: { id } }),
    onSuccess: () => {
      invalidate()
      navigate({ to: '/products' })
    },
  })

  const move = useMutation({
    mutationFn: (data: Parameters<typeof recordMovement>[0]['data']) =>
      recordMovement({ data }),
    onSuccess: invalidate,
  })

  if (!product) {
    return (
      <main className="page-wrap px-4 py-12">
        <p>Product not found.</p>
        <Link to="/products" className="btn-secondary mt-4">
          <ArrowLeft size={14} /> Back to products
        </Link>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <div className="mb-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
        >
          <ArrowLeft size={14} /> All products
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">
            {product.category} · SKU {product.sku}
          </p>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <StockBadge status={getStockStatus(product)} />
            <span className="text-sm text-[var(--sea-ink-soft)]">
              {product.stock} units · reorder at {product.reorderPoint}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            if (confirm(`Delete ${product.name}? This cannot be undone.`))
              remove.mutate()
          }}
          disabled={remove.isPending}
        >
          <Trash2 size={14} /> Delete
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="island-shell rounded-2xl p-5 lg:col-span-2">
          <p className="island-kicker mb-2">Details</p>
          <h2 className="m-0 mb-4 text-lg font-semibold text-[var(--sea-ink)]">
            Edit product
          </h2>
          {update.error && (
            <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {(update.error as Error).message}
            </p>
          )}
          <ProductForm
            initial={product}
            suppliers={suppliers}
            submitLabel="Save changes"
            pending={update.isPending}
            onSubmit={(values) => update.mutate({ id, ...values })}
          />
        </section>

        <aside className="flex flex-col gap-4">
          <section className="island-shell rounded-2xl p-5">
            <p className="island-kicker mb-2">Snapshot</p>
            <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
              <Stat label="On-hand" value={`${product.stock}`} />
              <Stat
                label="Stock value"
                value={currency.format(product.stock * product.costPrice)}
              />
              <Stat
                label="Unit price"
                value={currency.format(product.unitPrice)}
              />
              <Stat
                label="Cost price"
                value={currency.format(product.costPrice)}
              />
            </dl>
          </section>

          <MovementPanel
            currentStock={product.stock}
            pending={move.isPending}
            error={move.error as Error | null}
            onRecord={(type, quantity, reason) =>
              move.mutate({
                productId: id,
                type,
                quantity,
                reason,
              })
            }
          />
        </aside>
      </div>

      <section className="island-shell mt-6 rounded-2xl p-5">
        <p className="island-kicker mb-2">History</p>
        <h2 className="m-0 mb-3 text-lg font-semibold text-[var(--sea-ink)]">
          Stock movements
        </h2>
        {movements.length === 0 ? (
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            No movements yet for this product.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th className="text-right">Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="text-[var(--sea-ink-soft)]">
                      {dateFmt.format(new Date(m.createdAt))}
                    </td>
                    <td className="capitalize">{m.type}</td>
                    <td
                      className={`text-right font-mono tabular-nums ${
                        m.quantity > 0
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td>{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
        {label}
      </dt>
      <dd className="m-0 mt-0.5 text-base font-bold tabular-nums text-[var(--sea-ink)]">
        {value}
      </dd>
    </div>
  )
}

function MovementPanel({
  currentStock,
  pending,
  error,
  onRecord,
}: {
  currentStock: number
  pending: boolean
  error: Error | null
  onRecord: (
    type: StockMovementType,
    quantity: number,
    reason: string,
  ) => void
}) {
  const [type, setType] = useState<StockMovementType>('in')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = stockMovementInputSchema.safeParse({
      productId: 'placeholder',
      type,
      quantity,
      reason,
    })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    setFormError(null)
    onRecord(type, quantity, reason)
    setReason('')
    setQuantity(1)
  }

  return (
    <section className="island-shell rounded-2xl p-5">
      <p className="island-kicker mb-2">Adjust</p>
      <h2 className="m-0 mb-3 text-lg font-semibold text-[var(--sea-ink)]">
        Record movement
      </h2>
      <p className="m-0 mb-3 text-xs text-[var(--sea-ink-soft)]">
        Current on-hand: <span className="font-mono">{currentStock}</span>
      </p>
      {(formError || error) && (
        <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {formError ?? error?.message}
        </p>
      )}
      <form onSubmit={submit} className="grid gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Type
          </span>
          <select
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value as StockMovementType)}
          >
            <option value="in">Stock in (receive)</option>
            <option value="out">Stock out (ship)</option>
            <option value="adjust">Adjustment (+/-)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Quantity
          </span>
          <input
            type="number"
            step="1"
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          {type === 'adjust' && (
            <span className="mt-1 block text-xs text-[var(--sea-ink-soft)]">
              Use negative numbers to decrease stock.
            </span>
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Reason
          </span>
          <input
            className="form-input"
            placeholder="e.g. PO-2025-118 received"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Recording…' : 'Record'}
        </button>
      </form>
    </section>
  )
}
