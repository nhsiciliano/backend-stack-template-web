import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine, Settings2 } from 'lucide-react'
import { movementsQuery, productsQuery } from '#/lib/inventory/queries'

export const Route = createFileRoute('/movements')({
  component: MovementsPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(movementsQuery()),
      context.queryClient.ensureQueryData(productsQuery()),
    ])
  },
})

const dateFmt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function MovementsPage() {
  const { data: movements } = useSuspenseQuery(movementsQuery())
  const { data: products } = useSuspenseQuery(productsQuery())
  const productById = new Map(products.map((p) => [p.id, p]))

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <header className="mb-6">
        <p className="island-kicker mb-1">Audit trail</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Stock Movements
        </h1>
        <p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
          Every stock change — receipts, shipments, and manual adjustments.
        </p>
      </header>

      <section className="island-shell rounded-2xl p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Product</th>
                <th>Type</th>
                <th className="text-right">Qty</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const p = productById.get(m.productId)
                return (
                  <tr key={m.id}>
                    <td className="text-[var(--sea-ink-soft)]">
                      {dateFmt.format(new Date(m.createdAt))}
                    </td>
                    <td>
                      {p ? (
                        <Link
                          to="/products/$id"
                          params={{ id: p.id }}
                          className="font-semibold text-[var(--sea-ink)] no-underline hover:underline"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--sea-ink-soft)]">
                          {m.productId}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        {m.type === 'in' && <ArrowDownToLine size={12} />}
                        {m.type === 'out' && <ArrowUpFromLine size={12} />}
                        {m.type === 'adjust' && <Settings2 size={12} />}
                        {m.type}
                      </span>
                    </td>
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
                )
              })}
              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-[var(--sea-ink-soft)]"
                  >
                    No movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
