import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  DollarSign,
  PackageX,
  Settings2,
} from 'lucide-react'
import {
  dashboardQuery,
  movementsQuery,
  productsQuery,
} from '#/lib/inventory/queries'
import { getStockStatus, StockBadge } from '#/components/inventory/StockBadge'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(dashboardQuery()),
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(movementsQuery(undefined, 6)),
    ])
  },
})

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compact = new Intl.NumberFormat('en-US')

function MovementIcon({ type }: { type: 'in' | 'out' | 'adjust' }) {
  if (type === 'in') return <ArrowDownToLine size={14} />
  if (type === 'out') return <ArrowUpFromLine size={14} />
  return <Settings2 size={14} />
}

function Dashboard() {
  const { data: metrics } = useSuspenseQuery(dashboardQuery())
  const { data: products } = useSuspenseQuery(productsQuery())
  const { data: movements } = useSuspenseQuery(movementsQuery(undefined, 6))

  const lowStock = products
    .filter((p) => p.stock <= p.reorderPoint)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)

  const productById = new Map(products.map((p) => [p.id, p]))

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <header className="mb-6">
        <p className="island-kicker mb-1">Operations</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Inventory Dashboard
        </h1>
        <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
          Real-time view of stock levels, movements, and reorder signals.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Products"
          value={compact.format(metrics.productCount)}
          icon={<Boxes size={16} />}
        />
        <MetricCard
          label="Total units"
          value={compact.format(metrics.totalUnits)}
          icon={<Boxes size={16} />}
        />
        <MetricCard
          label="Inventory value"
          value={currency.format(metrics.inventoryValue)}
          icon={<DollarSign size={16} />}
        />
        <MetricCard
          label="Needs reorder"
          value={`${metrics.lowStockCount + metrics.outOfStockCount}`}
          accent={
            metrics.outOfStockCount > 0
              ? 'danger'
              : metrics.lowStockCount > 0
                ? 'warn'
                : 'ok'
          }
          icon={
            metrics.outOfStockCount > 0 ? (
              <PackageX size={16} />
            ) : (
              <AlertTriangle size={16} />
            )
          }
        />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="island-shell rounded-2xl p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="island-kicker mb-1">Reorder signals</p>
              <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
                Low &amp; out of stock
              </h2>
            </div>
            <Link
              to="/products"
              search={{ filter: 'low' }}
              className="text-sm font-semibold text-emerald-700 no-underline hover:underline dark:text-emerald-300"
            >
              View all →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              Everything is above reorder point. Nice.
            </p>
          ) : (
            <ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <Link
                      to="/products/$id"
                      params={{ id: p.id }}
                      className="block truncate text-sm font-semibold text-[var(--sea-ink)] no-underline hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="m-0 truncate text-xs text-[var(--sea-ink-soft)]">
                      SKU {p.sku} · reorder at {p.reorderPoint}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="text-sm font-mono tabular-nums text-[var(--sea-ink)]">
                      {p.stock}
                    </span>
                    <StockBadge status={getStockStatus(p)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="island-shell rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4">
            <p className="island-kicker mb-1">Activity</p>
            <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
              Recent movements
            </h2>
          </div>
          {movements.length === 0 ? (
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
              No movements yet.
            </p>
          ) : (
            <ul className="m-0 list-none space-y-2.5 p-0">
              {movements.map((m) => {
                const p = productById.get(m.productId)
                return (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        m.type === 'in'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : m.type === 'out'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                      }`}
                    >
                      <MovementIcon type={m.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">
                        {p?.name ?? m.productId}
                        <span className="ml-2 font-mono tabular-nums text-xs text-[var(--sea-ink-soft)]">
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </p>
                      <p className="m-0 truncate text-xs text-[var(--sea-ink-soft)]">
                        {m.reason}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent?: 'ok' | 'warn' | 'danger'
}) {
  const accentClass =
    accent === 'danger'
      ? 'text-rose-600 dark:text-rose-300'
      : accent === 'warn'
        ? 'text-amber-600 dark:text-amber-300'
        : 'text-[var(--sea-ink)]'
  return (
    <article className="island-shell rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between text-[var(--sea-ink-soft)]">
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <p className={`m-0 text-2xl font-bold tabular-nums ${accentClass}`}>
        {value}
      </p>
    </article>
  )
}
