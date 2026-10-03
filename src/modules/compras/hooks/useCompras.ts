import { useEffect, useState } from 'react'
import { compraService } from '../services/compraService'
import type { Compra, ComprasMeta } from '../types/compra'

const initialMeta: ComprasMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

export interface UseComprasOptions {
  search?: string
  fechaInicio?: string
  fechaFinal?: string
}

export function useCompras({
  search = '',
  fechaInicio = '',
  fechaFinal = '',
}: UseComprasOptions = {}) {
  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${fechaInicio}:${fechaFinal}:${refreshIndex}`
  const [result, setResult] = useState({
    key: '',
    compras: [] as Compra[],
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
    const key = `${page}:${debouncedSearch}:${fechaInicio}:${fechaFinal}:${refreshIndex}`

    compraService
      .getAll({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFinal: fechaFinal || undefined,
      })
      .then((response) => {
        if (!isActive) return
        setResult({ key, compras: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, compras: [], meta: initialMeta, error: 'No se pudieron cargar las compras' })
        }
      })

    return () => {
      isActive = false
    }
  }, [page, debouncedSearch, fechaInicio, fechaFinal, refreshIndex])

  const changePage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
  }

  const refetch = () => {
    setRefreshIndex((prev) => prev + 1)
  }

  return {
    compras: result.key === requestKey ? result.compras : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    changePage,
    refetch,
  }
}