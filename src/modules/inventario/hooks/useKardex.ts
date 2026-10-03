import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSucursalScope, type SucursalScopeMode } from '../../../hooks/useSucursalScope'
import { inventarioSucursalService } from '../services/inventarioSucursalService'
import { productoService } from '../services/productoService'
import type {
  InventarioSucursal,
  SucursalInventario,
} from '../types/inventarioSucursal'
import type { Producto } from '../types/producto'

const MIN_PRODUCTO_QUERY_LENGTH = 3
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300
const PRODUCTO_SEARCH_LIMIT = 20

export interface UseKardexReturn {
  inventarios: InventarioSucursal[]
  filteredInventarios: InventarioSucursal[]
  sucursales: SucursalInventario[]
  loading: boolean
  error: string | null
  // Sucursal
  kardexMode: SucursalScopeMode
  showSucursalFilter: boolean
  fixedSucursalNombre?: string
  // Filtros
  selectedSucursal: number | undefined
  setSelectedSucursal: (val: number | undefined) => void
  selectedProducto: number | undefined
  setSelectedProducto: (val: number | undefined) => void
  productoResultados: Producto[]
  productoSeleccionado: Producto | null
  setProductoSearchTerm: (val: string) => void
  isSearchingProductos: boolean
  stockBajoOnly: boolean
  setStockBajoOnly: (val: boolean) => void
  searchTerm: string
  setSearchTerm: (val: string) => void
  // Paginación
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit: (limit: number) => void
  totalPages: number
  totalItems: number
  // Métricas
  stats: {
    totalSkus: number
    totalStockUnits: number
    totalValorizado: number
    criticalStockCount: number
  }
  // Acciones
  refresh: () => void
}

export const useKardex = (): UseKardexReturn => {
  const {
    sucursalesPropias,
    mode: kardexMode,
    sucursalFija,
  } = useSucursalScope()

  const [inventarios, setInventarios] = useState<InventarioSucursal[]>([])
  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])

  const [selectedSucursal, setSelectedSucursal] = useState<number | undefined>(
    sucursalFija ? sucursalFija.idSucursal : undefined,
  )
  const [selectedProducto, setSelectedProductoState] = useState<number | undefined>(undefined)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [productoSearchTerm, setProductoSearchTerm] = useState<string>('')
  const [productoResultados, setProductoResultados] = useState<Producto[]>([])
  const [isSearchingProductos, setIsSearchingProductos] = useState<boolean>(false)
  const [stockBajoOnly, setStockBajoOnly] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  const isRestricted = kardexMode !== 'select-todas'

  // Sucursal efectiva: fija cuando el scope es automático, elegida por el usuario en otro caso
  const effectiveSucursal =
    kardexMode === 'auto' && sucursalFija ? sucursalFija.idSucursal : selectedSucursal

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // Carga inicial de sucursales
  useEffect(() => {
    const controller = new AbortController()

    async function loadCatalogs() {
      try {
        if (kardexMode === 'select-todas') {
          const sucursalesData = await inventarioSucursalService.getSucursales(controller.signal)
          setSucursales(sucursalesData)
        } else {
          setSucursales(sucursalesPropias)
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError' && (err as Error).name !== 'AbortError') {
          console.error('Error cargando catálogos de inventario:', err)
        }
      }
    }

    loadCatalogs()

    return () => {
      controller.abort()
    }
  }, [kardexMode, isRestricted, sucursalesPropias])

  // Búsqueda remota de productos con debounce
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

  // Carga de inventario filtrado desde backend
  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchInventarios() {
      setLoading(true)
      setError(null)

      try {
        const res = await inventarioSucursalService.getInventarios(
          {
            page,
            limit,
            idSucursal: effectiveSucursal,
            idProducto: selectedProducto,
            stockBajo: stockBajoOnly ? true : undefined,
          },
          controller.signal,
        )

        if (ignore) return
        setInventarios(res.data || [])
        setTotalPages(res.meta?.totalPages || 1)
        setTotalItems(res.meta?.total || 0)
      } catch (err: unknown) {
        if (ignore) return
        if (
          (err as Error).name !== 'CanceledError' &&
          (err as Error).name !== 'AbortError'
        ) {
          setError('No se pudo cargar la información de existencias de inventario.')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchInventarios()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [page, limit, effectiveSucursal, selectedProducto, stockBajoOnly, refreshTrigger])

  // Filtrado de búsqueda local por SKU / Nombre
  const filteredInventarios = useMemo(() => {
    if (!searchTerm.trim()) return inventarios
    const query = searchTerm.toLowerCase().trim()

    return inventarios.filter((item) => {
      const prodName = item.producto?.nombreProducto?.toLowerCase() ?? ''
      const prodCode = item.producto?.codigoProducto?.toLowerCase() ?? ''
      const sucName = item.sucursal?.nombreSucursal?.toLowerCase() ?? ''
      return prodName.includes(query) || prodCode.includes(query) || sucName.includes(query)
    })
  }, [inventarios, searchTerm])

  // Cálculo de KPIs en un solo paso (js-combine-iterations)
  const stats = useMemo(() => {
    let totalStockUnits = 0
    let totalValorizado = 0
    let criticalStockCount = 0

    for (const item of inventarios) {
      const stock = item.stockActual ?? 0
      const min = item.stockMinimo ?? 0
      const costo = Number(item.producto?.ultimoCosto ?? 0)

      totalStockUnits += stock
      totalValorizado += stock * (isNaN(costo) ? 0 : costo)
      if (stock <= min) {
        criticalStockCount += 1
      }
    }

    return {
      totalSkus: totalItems,
      totalStockUnits,
      totalValorizado,
      criticalStockCount,
    }
  }, [inventarios, totalItems])

  return {
    inventarios,
    filteredInventarios,
    sucursales,
    productoResultados,
    productoSeleccionado,
    setProductoSearchTerm,
    isSearchingProductos,
    loading,
    error,
    kardexMode,
    showSucursalFilter: kardexMode !== 'auto',
    fixedSucursalNombre: sucursalFija?.nombreSucursal,
    selectedSucursal: effectiveSucursal,
    setSelectedSucursal: (val) => {
      if (kardexMode === 'auto') return
      setSelectedSucursal(val)
      setPage(1)
    },
    selectedProducto,
    setSelectedProducto: (val) => {
      setSelectedProductoState(val)
      setProductoSeleccionado(
        val != null
          ? productoResultados.find((p) => p.idProducto === val) ??
              (productoSeleccionado?.idProducto === val ? productoSeleccionado : null)
          : null,
      )
      setProductoSearchTerm('')
      setProductoResultados([])
      setPage(1)
    },
    stockBajoOnly,
    setStockBajoOnly: (val) => {
      setStockBajoOnly(val)
      setPage(1)
    },
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,
    stats,
    refresh,
  }
}