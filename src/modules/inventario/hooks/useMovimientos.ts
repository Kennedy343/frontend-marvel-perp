import { useCallback, useEffect, useState } from 'react'
import { useSucursalScope } from '../../../hooks/useSucursalScope'
import { movimientoService } from '../services/movimientoService'
import { inventarioSucursalService } from '../services/inventarioSucursalService'
import { productoService } from '../services/productoService'
import type {
  MovimientoInventario,
  MovimientosMeta,
  OrigenMovimiento,
  TipoMovimiento,
} from '../types/movimiento'
import type { Producto } from '../types/producto'
import type { SucursalInventario } from '../types/inventarioSucursal'

const initialMeta: MovimientosMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const PAGE_LIMIT = 10

const MIN_PRODUCTO_QUERY_LENGTH = 3
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300
const PRODUCTO_SEARCH_LIMIT = 20

export function useMovimientos() {
  const { sucursalesPropias, mode, sucursalFija } = useSucursalScope()

  const isRestricted = mode !== 'select-todas'

  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])

  const [selectedProducto, setSelectedProductoState] = useState<number | undefined>(undefined)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [productoSearchTerm, setProductoSearchTerm] = useState('')
  const [productoResultados, setProductoResultados] = useState<Producto[]>([])
  const [isSearchingProductos, setIsSearchingProductos] = useState(false)
  const [selectedSucursal, setSelectedSucursalState] = useState<number | undefined>(
    sucursalFija?.idSucursal,
  )
  const [tipo, setTipoState] = useState<TipoMovimiento | undefined>(undefined)
  const [origen, setOrigenState] = useState<OrigenMovimiento | undefined>(undefined)
  const [desde, setDesdeState] = useState<string>('')
  const [hasta, setHastaState] = useState<string>('')

  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const [result, setResult] = useState({
    key: '',
    movimientos: [] as MovimientoInventario[],
    meta: initialMeta,
    error: null as string | null,
  })

  // Sucursal efectiva: fija cuando el scope es automático, elegida por el usuario en otro caso
  const effectiveSucursal =
    mode === 'auto' && sucursalFija ? sucursalFija.idSucursal : selectedSucursal

  const requestKey = `${page}:${PAGE_LIMIT}:${selectedProducto ?? ''}:${effectiveSucursal ?? ''}:${tipo ?? ''}:${origen ?? ''}:${desde}:${hasta}:${refreshIndex}`

  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalogs() {
      try {
        const sucursalesData =
          mode === 'select-todas'
            ? await inventarioSucursalService.getSucursales(controller.signal)
            : sucursalesPropias
        setSucursales(sucursalesData)
      } catch (err: unknown) {
        if (
          (err as Error).name !== 'CanceledError' &&
          (err as Error).name !== 'AbortError'
        ) {
          console.error('Error cargando catálogos de movimientos:', err)
        }
      }
    }

    loadCatalogs()

    return () => controller.abort()
  }, [mode, isRestricted, sucursalesPropias])

  useEffect(() => {
    let cancelled = false
    const query = productoSearchTerm.trim()

    const timeout = window.setTimeout(async () => {
      if (query.length < MIN_PRODUCTO_QUERY_LENGTH) {
        if (!cancelled) {
          setProductoResultados([])
          setIsSearchingProductos(false)
        }
        return
      }

      setIsSearchingProductos(true)
      try {
        const res = await productoService.getAll({
          search: query,
          limit: PRODUCTO_SEARCH_LIMIT,
          ...(isRestricted ? { scopeSucursal: true } : {}),
        })
        if (!cancelled) setProductoResultados(res.data)
      } catch {
        if (!cancelled) setProductoResultados([])
      } finally {
        if (!cancelled) setIsSearchingProductos(false)
      }
    }, PRODUCTO_SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [productoSearchTerm, isRestricted])

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    const query = {
      page,
      limit: PAGE_LIMIT,
      ...(selectedProducto !== undefined ? { idProducto: selectedProducto } : {}),
      ...(effectiveSucursal !== undefined ? { idSucursal: effectiveSucursal } : {}),
      ...(tipo !== undefined ? { tipo } : {}),
      ...(origen !== undefined ? { origen } : {}),
      ...(desde ? { desde: `${desde}T00:00:00.000Z` } : {}),
      ...(hasta ? { hasta: `${hasta}T23:59:59.999Z` } : {}),
    }

    async function fetchMovimientos() {
      try {
        const res = await movimientoService.getAll(query, controller.signal)
        if (ignore) return
        setResult({
          key: requestKey,
          movimientos: res.data ?? [],
          meta: res.meta ?? initialMeta,
          error: null,
        })
      } catch (err: unknown) {
        if (
          (err as Error).name === 'CanceledError' ||
          (err as Error).name === 'AbortError'
        ) {
          return
        }
        if (!ignore) {
          setResult({
            key: requestKey,
            movimientos: [],
            meta: initialMeta,
            error: 'No se pudieron cargar los movimientos de inventario.',
          })
        }
      }
    }

    fetchMovimientos()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [requestKey, page, selectedProducto, effectiveSucursal, tipo, origen, desde, hasta])

  const resetPage = useCallback(() => setPage(1), [])

  const setSelectedProducto = useCallback(
    (val: number | undefined) => {
      setSelectedProductoState(val)
      setProductoSeleccionado(
        val != null
          ? productoResultados.find((p) => p.idProducto === val) ??
              (productoSeleccionado?.idProducto === val ? productoSeleccionado : null)
          : null,
      )
      setProductoSearchTerm('')
      setProductoResultados([])
      resetPage()
    },
    [productoResultados, productoSeleccionado, resetPage],
  )

  const setSelectedSucursal = useCallback(
    (val: number | undefined) => {
      if (mode === 'auto') return
      setSelectedSucursalState(val)
      resetPage()
    },
    [mode, resetPage],
  )

  const setTipo = useCallback(
    (val: TipoMovimiento | undefined) => {
      setTipoState(val)
      resetPage()
    },
    [resetPage],
  )

  const setOrigen = useCallback(
    (val: OrigenMovimiento | undefined) => {
      setOrigenState(val)
      resetPage()
    },
    [resetPage],
  )

  const setDesde = useCallback(
    (val: string) => {
      setDesdeState(val)
      resetPage()
    },
    [resetPage],
  )

  const setHasta = useCallback(
    (val: string) => {
      setHastaState(val)
      resetPage()
    },
    [resetPage],
  )

  const resetFilters = useCallback(() => {
    setSelectedProductoState(undefined)
    setProductoSeleccionado(null)
    setProductoSearchTerm('')
    setProductoResultados([])
    setTipoState(undefined)
    setOrigenState(undefined)
    setDesdeState('')
    setHastaState('')
    if (mode !== 'auto') setSelectedSucursalState(undefined)
    setPage(1)
  }, [mode])

  const refresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  const changePage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
    },
    [result.meta.totalPages],
  )

  const isCurrent = result.key === requestKey

  return {
    movimientos: isCurrent ? result.movimientos : [],
    meta: isCurrent ? result.meta : initialMeta,
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,
    sucursales,
    productoResultados,
    productoSeleccionado,
    productoSearchTerm,
    setProductoSearchTerm,
    isSearchingProductos,
    showSucursalFilter: mode !== 'auto',
    fixedSucursalNombre: sucursalFija?.nombreSucursal,
    selectedProducto,
    setSelectedProducto,
    selectedSucursal: effectiveSucursal,
    setSelectedSucursal,
    tipo,
    setTipo,
    origen,
    setOrigen,
    desde,
    setDesde,
    hasta,
    setHasta,
    page,
    changePage,
    resetFilters,
    refresh,
  }
}
