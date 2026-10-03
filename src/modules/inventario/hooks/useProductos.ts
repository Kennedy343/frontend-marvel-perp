import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { productoService } from '../services/productoService'
import type { Producto, ProductosMeta } from '../types/producto'
import type { User } from '../../../types/user'

const initialMeta: ProductosMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

function hasSucursalesAsignadas(user: User | null): boolean {
  if (user?.sucursales && user.sucursales.length > 0) return true
  return user?.idSucursal != null && Boolean(user.nombreSucursal)
}

export function useProductos(search: string) {
  const user = useAuthStore((s) => s.user)
  const isRestricted = hasSucursalesAsignadas(user)

  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${refreshIndex}`
  const [result, setResult] = useState({
    key: '',
    productos: [] as Producto[],
    meta: initialMeta,
    error: null as string | null,
  })

  useEffect(() => {
    const trimmed = search.trim()
    const timer = setTimeout(() => {
      setDebouncedSearch(trimmed)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let isActive = true
    const key = `${page}:${debouncedSearch}:${refreshIndex}`

    productoService
      .getAll({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        scopeSucursal: isRestricted ? true : undefined,
      })
      .then((response) => {
        if (!isActive) return
        setResult({ key, productos: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, productos: [], meta: initialMeta, error: 'No se pudieron cargar los productos' })
        }
      })

    return () => {
      isActive = false
    }
  }, [page, debouncedSearch, refreshIndex, isRestricted])

  const changePage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
  }

  const refetch = () => {
    setRefreshIndex((prev) => prev + 1)
  }

  return {
    productos: result.key === requestKey ? result.productos : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    changePage,
    refetch,
  }
}