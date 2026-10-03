import { memo } from 'react'
import { GuardarVentaButton } from './GuardarVentaButton'

interface OrdenBarMovilProps {
  totalVenta: number
  isSubmitting: boolean
  canSubmit: boolean
  onGuardar: () => void
}

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (value: number): string => moneyFormatter.format(value)

export const OrdenBarMovil = memo(function OrdenBarMovil({
  totalVenta,
  isSubmitting,
  canSubmit,
  onGuardar,
}: OrdenBarMovilProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(2_6_23_/_0.15)] backdrop-blur lg:hidden">
      <div className="min-w-0">
        <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
          Total
        </p>
        <p className="font-sora text-xl font-bold tracking-tight text-navy-950 tabular-nums">
          {formatCurrency(totalVenta)}
        </p>
      </div>
      <div className="w-44 shrink-0">
        <GuardarVentaButton
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          onGuardar={onGuardar}
        />
      </div>
    </div>
  )
})
