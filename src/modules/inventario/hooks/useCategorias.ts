import { useEffect, useState } from 'react'
import { categoriaService } from '../services/categoriaService'
import type { CategoriaProducto, CategoriasMeta } from '../types/categoria'

const initialMeta: CategoriasMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

export function useCategorias(search: string) {
  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${refreshIndex}`
  const [result, setResult] = useState({
    key: '',
    categorias: [] as CategoriaProducto[],
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

    categoriaService
      .getAll({ page, limit: 10, search: debouncedSearch || undefined })
      .then((response) => {
        if (!isActive) return
        setResult({ key, categorias: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, categorias: [], meta: initialMeta, error: 'No se pudieron cargar las categorías' })
        }
      })

    return () => {
      isActive = false
    }
  }, [page, debouncedSearch, refreshIndex])

  const changePage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
  }

  const refetch = () => {
    setRefreshIndex((prev) => prev + 1)
  }

  return {
    categorias: result.key === requestKey ? result.categorias : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    changePage,
    refetch,
  }
}