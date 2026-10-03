interface ProveedorFormActionsProps {
  requiredFieldsFilled: number
  requiredFieldsTotal: number
  isSubmitting: boolean
  isSuccess: boolean
  submitLabel: string
  loadingSubmitLabel: string
  onCancel: () => void
}

export default function ProveedorFormActions({
  requiredFieldsFilled,
  requiredFieldsTotal,
  isSubmitting,
  isSuccess,
  submitLabel,
  loadingSubmitLabel,
  onCancel,
}: ProveedorFormActionsProps) {
  const isLocked = isSubmitting || isSuccess

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-soft backdrop-blur">
      <p className="text-xs text-gray-500">
        <span className="font-semibold tabular-nums text-navy-950">
          {requiredFieldsFilled}/{requiredFieldsTotal}
        </span>{' '}
        campos obligatorios completados
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLocked}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLocked}
          className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? loadingSubmitLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}
