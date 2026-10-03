import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import { formatCurrency, formatNumber } from '../../../lib/format'
import type { EstadisticasPorPeriodo } from '../../ventas/hooks/useEstadisticasVentas'
import { PERIODOS_META } from './periodosMeta'

const ICONOS: Record<string, string> = {
  dia: 'icon-calendar',
  semana: 'icon-clock',
  mes: 'icon-sales',
  trimestre: 'icon-dashboard',
  anio: 'icon-cart',
}

interface VentasMetricaCardsProps {
  data: EstadisticasPorPeriodo
  isLoading: boolean
}

function SkeletonCelda() {
  return (
    <>
      <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-7 w-24 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-3 w-28 animate-pulse rounded bg-gray-100" />
    </>
  )
}

export const VentasMetricaCards = memo(function VentasMetricaCards({
  data,
  isLoading,
}: VentasMetricaCardsProps) {
  return (
    <section
      aria-label="Ventas por periodo"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-card lg:grid-cols-5"
    >
      {PERIODOS_META.map((meta) => {
        const estadistica = data[meta.periodo]
        const monto = estadistica?.montoTotal ?? 0
        const total = estadistica?.totalVentas ?? 0
        const ticket = estadistica?.ticketPromedio ?? 0

        return (
          <div key={meta.periodo} className="bg-white px-4 py-5 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
                {meta.label}
              </p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
                <Icon name={ICONOS[meta.periodo] as never} className="size-4" />
              </div>
            </div>

            {isLoading ? (
              <SkeletonCelda />
            ) : (
              <>
                <p className="mt-3 truncate font-sora text-xl font-bold tracking-tight text-navy-950 tabular-nums sm:text-2xl">
                  {formatCurrency(monto)}
                </p>
                <p className="mt-2 truncate font-dm-sans text-xs text-gray-400">
                  {formatNumber(total)} ventas · ticket {formatCurrency(ticket)}
                </p>
              </>
            )}
          </div>
        )
      })}
    </section>
  )
})
