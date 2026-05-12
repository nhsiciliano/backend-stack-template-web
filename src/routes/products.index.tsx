import { z } from 'zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Plus, Search, X } from 'lucide-react'
import {
  inventoryKeys,
  productsQuery,
  suppliersQuery,
} from '#/lib/inventory/queries'
import { createProduct } from '#/server/inventory'
import { getStockStatus, StockBadge } from '#/components/inventory/StockBadge'
import { ProductForm } from '#/components/inventory/ProductForm'

const searchSchema = z.object({
  q: z.string().optional(),
  filter: z.enum(['all', 'low', 'out']).optional(),
  new: z.boolean().optional(),
})

export const Route = createFileRoute('/products/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q, filter: search.filter }),
  component: ProductsPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(suppliersQuery()),
    ])
  },
})

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function ProductsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: products } = useSuspenseQuery(productsQuery())
  const { data: suppliers } = useSuspenseQuery(suppliersQuery())
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (data: Parameters<typeof createProduct>[0]['data']) =>
      createProduct({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      navigate({ search: (prev) => ({ ...prev, new: undefined }) })
    },
  })

  const q = search.q?.toLowerCase() ?? ''
  const filter = search.filter ?? 'all'

  const filtered = products.filter((p) => {
    if (filter === 'low' && p.stock > p.reorderPoint) return false
    if (filter === 'out' && p.stock !== 0) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })

  const supplierName = (id: string | null) =>
    id ? (suppliers.find((s) => s.id === id)?.name ?? '—') : '—'

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">Catalog</p>
          <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            Products
          </h1>
          <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
            {filtered.length} of {products.length} shown
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            navigate({ search: (prev) => ({ ...prev, new: true }) })
          }
        >
          <Plus size={16} /> New product
        </button>
      </header>

      <section className="island-shell rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[12rem]">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sea-ink-soft)]"
            />
            <input
              className="form-input pl-9"
              placeholder="Search name, SKU, category…"
              value={search.q ?? ''}
              onChange={(e) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    q: e.target.value || undefined,
                  }),
                })
              }
            />
          </div>
          <FilterTab
            label="All"
            active={filter === 'all'}
            onClick={() =>
              navigate({
                search: (prev) => ({ ...prev, filter: undefined }),
              })
            }
          />
          <FilterTab
            label="Low stock"
            active={filter === 'low'}
            onClick={() =>
              navigate({ search: (prev) => ({ ...prev, filter: 'low' }) })
            }
          />
          <FilterTab
            label="Out of stock"
            active={filter === 'out'}
            onClick={() =>
              navigate({ search: (prev) => ({ ...prev, filter: 'out' }) })
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="font-semibold text-[var(--sea-ink)] no-underline hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-[var(--sea-ink-soft)]">
                      {p.location || '—'}
                    </div>
                  </td>
                  <td className="font-mono text-xs">{p.sku}</td>
                  <td>{p.category}</td>
                  <td className="text-[var(--sea-ink-soft)]">
                    {supplierName(p.supplierId)}
                  </td>
                  <td className="text-right tabular-nums">
                    {currency.format(p.unitPrice)}
                  </td>
                  <td className="text-right tabular-nums font-mono">
                    {p.stock}
                  </td>
                  <td>
                    <StockBadge status={getStockStatus(p)} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-[var(--sea-ink-soft)]"
                  >
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {search.new && (
        <Modal
          title="New product"
          onClose={() =>
            navigate({ search: (prev) => ({ ...prev, new: undefined }) })
          }
        >
          {create.error && (
            <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {(create.error as Error).message}
            </p>
          )}
          <ProductForm
            suppliers={suppliers}
            submitLabel="Create product"
            pending={create.isPending}
            onSubmit={(values) => create.mutate(values)}
            onCancel={() =>
              navigate({ search: (prev) => ({ ...prev, new: undefined }) })
            }
          />
        </Modal>
      )}
    </main>
  )
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
      }`}
    >
      {label}
    </button>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="island-shell w-full max-w-2xl rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
