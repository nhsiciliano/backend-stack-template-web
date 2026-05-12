import { useState } from 'react'
import type { ProductInput } from '#/lib/inventory/schemas'
import { productInputSchema } from '#/lib/inventory/schemas'
import type { Supplier } from '#/lib/inventory/types'

type FieldErrors = Partial<Record<keyof ProductInput, string>>

const EMPTY: ProductInput = {
  sku: '',
  name: '',
  description: '',
  category: '',
  unitPrice: 0,
  costPrice: 0,
  stock: 0,
  reorderPoint: 0,
  supplierId: null,
  location: '',
}

export function ProductForm({
  initial,
  suppliers,
  submitLabel,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Partial<ProductInput>
  suppliers: Supplier[]
  submitLabel: string
  onSubmit: (values: ProductInput) => void
  onCancel?: () => void
  pending?: boolean
}) {
  const [values, setValues] = useState<ProductInput>({ ...EMPTY, ...initial })
  const [errors, setErrors] = useState<FieldErrors>({})

  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = productInputSchema.safeParse(values)
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProductInput | undefined
        if (key && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="SKU" error={errors.sku}>
        <input
          required
          className="form-input"
          value={values.sku}
          onChange={(e) => update('sku', e.target.value)}
        />
      </Field>
      <Field label="Name" error={errors.name}>
        <input
          required
          className="form-input"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
        />
      </Field>
      <Field label="Category" error={errors.category}>
        <input
          required
          className="form-input"
          value={values.category}
          onChange={(e) => update('category', e.target.value)}
        />
      </Field>
      <Field label="Supplier" error={errors.supplierId}>
        <select
          className="form-input"
          value={values.supplierId ?? ''}
          onChange={(e) =>
            update('supplierId', e.target.value === '' ? null : e.target.value)
          }
        >
          <option value="">— None —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Unit price (USD)" error={errors.unitPrice}>
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={values.unitPrice}
          onChange={(e) => update('unitPrice', Number(e.target.value))}
        />
      </Field>
      <Field label="Cost price (USD)" error={errors.costPrice}>
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-input"
          value={values.costPrice}
          onChange={(e) => update('costPrice', Number(e.target.value))}
        />
      </Field>
      <Field label="Current stock" error={errors.stock}>
        <input
          type="number"
          step="1"
          min="0"
          className="form-input"
          value={values.stock}
          onChange={(e) => update('stock', Number(e.target.value))}
        />
      </Field>
      <Field label="Reorder point" error={errors.reorderPoint}>
        <input
          type="number"
          step="1"
          min="0"
          className="form-input"
          value={values.reorderPoint}
          onChange={(e) => update('reorderPoint', Number(e.target.value))}
        />
      </Field>
      <Field label="Location" error={errors.location}>
        <input
          className="form-input"
          placeholder="e.g. A-01-03"
          value={values.location}
          onChange={(e) => update('location', e.target.value)}
        />
      </Field>
      <Field label="Description" error={errors.description} full>
        <textarea
          rows={3}
          className="form-input"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 sm:col-span-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={pending}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string
  error?: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
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
