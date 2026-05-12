import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import {
  inventoryKeys,
  productsQuery,
  suppliersQuery,
} from '#/lib/inventory/queries'
import { createSupplier } from '#/server/inventory'
import { supplierInputSchema, type SupplierInput } from '#/lib/inventory/schemas'

export const Route = createFileRoute('/suppliers')({
  component: SuppliersPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(suppliersQuery()),
      context.queryClient.ensureQueryData(productsQuery()),
    ])
  },
})

function SuppliersPage() {
  const { data: suppliers } = useSuspenseQuery(suppliersQuery())
  const { data: products } = useSuspenseQuery(productsQuery())
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (data: SupplierInput) => createSupplier({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      setForm(EMPTY)
      setErrors({})
    },
  })

  const productCountFor = (id: string) =>
    products.filter((p) => p.supplierId === id).length

  const [form, setForm] = useState<SupplierInput>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierInput, string>>>({})

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = supplierInputSchema.safeParse(form)
    if (!parsed.success) {
      const next: Partial<Record<keyof SupplierInput, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SupplierInput | undefined
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    create.mutate(parsed.data)
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <header className="mb-6">
        <p className="island-kicker mb-1">Vendors</p>
        <h1 className="display-title text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          Suppliers
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="island-shell rounded-2xl p-5 lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-right">Products</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold text-[var(--sea-ink)]">
                      {s.name}
                    </td>
                    <td className="text-[var(--sea-ink-soft)]">{s.email}</td>
                    <td className="text-[var(--sea-ink-soft)]">
                      {s.phone || '—'}
                    </td>
                    <td className="text-right font-mono tabular-nums">
                      {productCountFor(s.id)}
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-[var(--sea-ink-soft)]"
                    >
                      No suppliers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Add new</p>
          <h2 className="m-0 mb-4 text-lg font-semibold text-[var(--sea-ink)]">
            New supplier
          </h2>
          {create.error && (
            <p className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {(create.error as Error).message}
            </p>
          )}
          <form onSubmit={submit} className="grid gap-3">
            <Field label="Name" error={errors.name}>
              <input
                required
                className="form-input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                required
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </Field>
            <button
              type="submit"
              className="btn-primary"
              disabled={create.isPending}
            >
              <Plus size={14} />
              {create.isPending ? 'Saving…' : 'Add supplier'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

const EMPTY: SupplierInput = { name: '', email: '', phone: '' }

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-300">
          {error}
        </span>
      )}
    </label>
  )
}
