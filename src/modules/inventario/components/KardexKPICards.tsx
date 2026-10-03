import { memo } from 'react'
import Icon from '../../../components/common/Icon'

interface KardexKPICardsProps {
  totalSkus: number
  totalUnits: number
  totalValorizado: number
  criticalCount: number
}

// Hoist pure currency formatter
const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (val: number): string => moneyFormatter.format(val)

const numberFormatter = new Intl.NumberFormat('es-GT')

const formatNumber = (val: number): string => numberFormatter.format(val)

export const KardexKPICards = memo(function KardexKPICards({
  totalSkus,
  totalUnits,
  totalValorizado,
  criticalCount,
}: KardexKPICardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total SKUs */}
      <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total Registros (SKU)
          </p>
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-inventory" className="size-5" />
          </div>
        </div>
        <p className="mt-3 font-sora text-2xl font-bold tracking-tight tabular-nums text-navy-950">
          {formatNumber(totalSkus)}
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          Asignaciones en sucursales
        </p>
      </article>

      {/* Total Unidades */}
      <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            Existencia Total
          </p>
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Icon name="icon-crm" className="size-5" />
          </div>
        </div>
        <p className="mt-3 font-sora text-2xl font-bold tracking-tight tabular-nums text-navy-950">
          {formatNumber(totalUnits)}{' '}
          <span className="font-dm-sans text-xs font-normal text-gray-400">uds</span>
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          Unidades físicas en inventario
        </p>
      </article>

      {/* Valorizado Total */}
      <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            Inventario Valorizado
          </p>
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Icon name="icon-cart" className="size-5" />
          </div>
        </div>
        <p className="mt-3 font-sora text-2xl font-bold tracking-tight tabular-nums text-navy-950">
          {formatCurrency(totalValorizado)}
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          Calculado a último costo
        </p>
      </article>

      {/* Alertas Stock Crítico */}
      <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            Stock Bajo / Crítico
          </p>
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${
              criticalCount > 0 ? 'bg-red-50 text-error-red' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <Icon name="icon-production-quantity-limits" className="size-5" />
          </div>
        </div>
        <p
          className={`mt-3 font-sora text-2xl font-bold tracking-tight tabular-nums ${
            criticalCount > 0 ? 'text-error-red' : 'text-navy-950'
          }`}
        >
          {criticalCount}
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          {criticalCount > 0
            ? 'Productos por debajo del mínimo'
            : 'Todos los productos en rango'}
        </p>
      </article>
    </section>
  )
})
