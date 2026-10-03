import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { ventaService } from '../services/ventaService'
import type { EstadisticasVenta, PeriodoEstadistica } from '../types/venta'

// Hoisted static value (Vercel Best Practice: prefer-module-scope-static-value)
const PERIODOS: PeriodoEstadistica[] = ['dia', 'semana', 'mes', 'trimestre', 'anio']

export type EstadisticasPorPeriodo = Partial<
  Record<PeriodoEstadistica, EstadisticasVenta>
>

export function useEstadisticasVentas(idSucursal?: number) {
  const [data, setData] = useState<EstadisticasPorPeriodo>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function loadEstadisticas() {
      setIsLoading(true)
      setError(null)
      try {
        const resultados = await Promise.all(
          PERIODOS.map((periodo) =>
            ventaService.getEstadisticas({ periodo, idSucursal }, controller.signal),
          ),
        )
        if (ignore) return

        const next = {} as EstadisticasPorPeriodo
        PERIODOS.forEach((periodo, index) => {
          const resultado = resultados[index]
          if (resultado) next[periodo] = resultado
        })
        setData(next)
      } catch (err: unknown) {
        if (ignore) return
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error al cargar estadísticas de ventas:', err)
          setError('No se pudieron cargar las estadísticas de ventas.')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadEstadisticas()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [idSucursal, reloadTrigger])

  return { data, isLoading, error, refetch }
}
