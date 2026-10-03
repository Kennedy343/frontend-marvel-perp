import { useState, useEffect, useCallback } from 'react'
import { isAxiosError } from 'axios'
import { ventaService } from '../services/ventaService'
import type { Venta, VentasMeta, VentasFilters } from '../types/venta'

export function useVentas(initialFilters: VentasFilters = {}, scopeSucursal?: number) {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [meta, setMeta] = useState<VentasMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState<VentasFilters>(initialFilters)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState<number>(0)

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  const updateFilters = useCallback((newFilters: Partial<VentasFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(1)
  }, [])

  const changePage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchVentas() {
      setIsLoading(true)
      setError(null)
      try {
        const scopedFilters =
          scopeSucursal !== undefined
            ? { ...filters, idSucursal: scopeSucursal }
            : filters
        const response = await ventaService.getAll(
          {
            ...scopedFilters,
            page,
            limit,
          },
          controller.signal,
        )
        if (ignore) return
        setVentas(response.data)
        setMeta(response.meta)
      } catch (err: unknown) {
        if (ignore) return
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error al cargar ventas:', err)
          setError('No se pudo cargar el listado de ventas.')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchVentas()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [filters, page, limit, reloadTrigger, scopeSucursal])

  return {
    ventas,
    meta,
    filters,
    page,
    limit,
    isLoading,
    error,
    updateFilters,
    changePage,
    changeLimit,
    refetch,
  }
}
