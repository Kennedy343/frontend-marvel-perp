import { Suspense, lazy, useEffect, useState } from 'react'
import SucursalCombobox from '../../../components/common/SucursalCombobox'
import { useAuthStore } from '../../../store/authStore'
import { useActiveSucursal } from '../../../hooks/useSucursalScope'
import { esAdministrador } from '../../../lib/roles'
import { useEstadisticasVentas } from '../../ventas/hooks/useEstadisticasVentas'
import { inventarioSucursalService } from '../../inventario/services/inventarioSucursalService'
import type { SucursalInventario } from '../../inventario/types/inventarioSucursal'
import { VentasMetricaCards } from './VentasMetricaCards'

// Lazy-loaded para code-split de Recharts (Vercel Best Practice: bundle-dynamic-imports)
const VentasComparativoChart = lazy(() =>
  import('./VentasComparativoChart').then((m) => ({ default: m.VentasComparativoChart })),
)

function EstadisticasVentasSection() {
  const user = useAuthStore((state) => state.user)
  const activeSucursal = useActiveSucursal()
  const isAdmin = esAdministrador(user)

  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState<number | undefined>(undefined)

  const resolvedSucursal = isAdmin ? selectedSucursal : activeSucursal?.idSucursal

  const { data, isLoading, error } = useEstadisticasVentas(resolvedSucursal)

  useEffect(() => {
    if (!isAdmin) return
    const controller = new AbortController()
    inventarioSucursalService
      .getSucursales(controller.signal)
      .then((res) => setSucursales(res || []))
      .catch((err) => console.error('Error al cargar sucursales:', err))
    return () => controller.abort()
  }, [isAdmin])

  return (
    <section className="space-y-4" aria-label="Estadísticas de ventas">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">
            Visión comercial
          </p>
          <h2 className="mt-1 font-sora text-xl font-semibold tracking-tight text-navy-950">
            Resumen de ventas
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Monto acumulado por periodo, solo ventas activas.
          </p>
        </div>

        {isAdmin && (
          <div className="w-full sm:w-64">
            <p className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600">
              Sucursal
            </p>
            <SucursalCombobox
              sucursales={sucursales}
              value={selectedSucursal}
              onChange={setSelectedSucursal}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-error-red">
          {error}
        </div>
      )}

      <VentasMetricaCards data={data} isLoading={isLoading} />
      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-2xl border border-gray-100 bg-white shadow-card" />
        }
      >
        <VentasComparativoChart data={data} />
      </Suspense>
    </section>
  )
}

export default EstadisticasVentasSection
