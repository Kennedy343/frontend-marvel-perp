import { useCallback, useEffect, useState } from 'react'
import { proveedorService } from '../services/proveedorService'
import type { Proveedor, ProveedoresMeta } from '../types/proveedor'

const initialMeta: ProveedoresMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

export function useProveedores(search: string, initialDepartamento?: number) {
  const [page, setPage] = useState(1)
  const [selectedDepartamento, setSelectedDepartamento] = useState<number | undefined>(
    initialDepartamento,
  )
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${selectedDepartamento ?? ''}:${refreshIndex}`

  const [result, setResult] = useState({
    key: '',
    proveedores: [] as Proveedor[],
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
    const controller = new AbortController()
    const key = `${page}:${debouncedSearch}:${selectedDepartamento ?? ''}:${refreshIndex}`

    proveedorService
      .getAll(
        {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
          idDepartamento: selectedDepartamento,
        },
        controller.signal,
      )
      .then((response) => {
        if (!isActive) return
        setResult({ key, proveedores: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({
            key,
            proveedores: [],
            meta: initialMeta,
            error: 'No se pudieron cargar los proveedores',
          })
        }
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [page, debouncedSearch, selectedDepartamento, refreshIndex])

  const changePage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
    },
    [result.meta.totalPages],
  )

  const handleDepartamentoFilter = useCallback((idDept?: number) => {
    setSelectedDepartamento(idDept)
    setPage(1)
  }, [])

  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  return {
    proveedores: result.key === requestKey ? result.proveedores : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    selectedDepartamento,
    setSelectedDepartamento: handleDepartamentoFilter,
    changePage,
    refetch,
  }
}
