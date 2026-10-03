import { useEffect, useState } from 'react'
import { usuarioService } from '../services/usuarioService'
import type { UsuariosMeta } from '../types/usuario'
import type { User } from '../../../types/user'

const initialMeta: UsuariosMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const SEARCH_DEBOUNCE_MS = 350

export function useUsuarios(search: string) {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const requestKey = `${page}:${debouncedSearch}:${reloadKey}`
  const [result, setResult] = useState({
    key: '',
    usuarios: [] as User[],
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
    const key = `${page}:${debouncedSearch}:${reloadKey}`

    usuarioService
      .getAll({ page, limit: 10, search: debouncedSearch || undefined })
      .then((response) => {
        if (!isActive) return
        setResult({ key, usuarios: response.data, meta: response.meta, error: null })
      })
      .catch(() => {
        if (isActive) {
          setResult({ key, usuarios: [], meta: initialMeta, error: 'No se pudieron cargar los usuarios' })
        }
      })

    return () => {
      isActive = false
    }
  }, [page, debouncedSearch, reloadKey])

  const changePage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, result.meta.totalPages || 1)))
  }

  const reload = () => {
    setReloadKey((prev) => prev + 1)
  }

  return {
    usuarios: result.key === requestKey ? result.usuarios : [],
    meta: result.key === requestKey ? result.meta : initialMeta,
    isLoading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : null,
    page,
    changePage,
    reload,
  }
}
