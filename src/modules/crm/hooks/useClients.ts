import { useCallback, useEffect, useState } from 'react'
import { clientService } from '../services/clientService'
import { useActiveSucursal } from '../../../hooks/useSucursalScope'
import type { Client, ClientsMeta } from '../types/client'

const initialMeta: ClientsMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

export function useClients(search: string) {
  const activeSucursal = useActiveSucursal()
  const idSucursal = activeSucursal?.idSucursal
  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${refreshIndex}:${idSucursal ?? ''}`
  const [result, setResult] = useState({
    key: '',
    clients: [] as Client[],
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
    const key = `${page}:${debouncedSearch}:${refreshIndex}:${idSucursal ?? ''}`

    clientService
      .getAll(
        { page, limit: 10, search: debouncedSearch || undefined, idSucursal },
        controller.signal,
      )
      .then((response) => {
        if (!isActive) return
        setResult({ key, clients: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, clients: [], meta: initialMeta, error: 'No se pudieron cargar los clientes' })
        }
      })

    return () => {
      isActive = false
      controller.abort()
    }
  }, [page, debouncedSearch, refreshIndex, idSucursal])

  const changePage = useCallback(
    (nextPage: number) => {
      setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
    },
    [result.meta.totalPages],
  )

  const refetch = useCallback(() => {
    setRefreshIndex((prev) => prev + 1)
  }, [])

  return {
    clients: result.key === requestKey ? result.clients : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    changePage,
    refetch,
  }
}
