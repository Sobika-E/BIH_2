import type { ReactNode } from 'react'

export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-semibold text-slate-700">{label}</div>
      {children}
      {error && <div className="mt-1 text-sm text-rose-600">{error}</div>}
    </label>
  )
}

