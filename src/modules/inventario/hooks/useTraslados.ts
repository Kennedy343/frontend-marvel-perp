import { useCallback, useEffect, useMemo, useState } from 'react'
import { trasladoService } from '../services/trasladoService'
import type {
  EstadoTraslado,
  Traslado,
  TrasladosMeta,
} from '../types/traslado'

const initialMeta: TrasladosMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

const PAGE_LIMIT = 10

export function useTraslados() {
  const [estado, setEstadoState] = useState<EstadoTraslado | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const [result, setResult] = useState({
    key: '',
    traslados: [] as Traslado[],
    meta: initialMeta,
    error: null as string | null,
  })

  const requestKey = `${page}:${PAGE_LIMIT}:${estado ?? ''}:${refreshIndex}`

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchTraslados() {
      try {
        const res = await trasladoService.getAll(
          {
            page,
            limit: PAGE_LIMIT,
            ...(estado !== undefined ? { estado } : {}),
          },
          controller.signal,
        )
        if (ignore) return
        setResult({
          key: requestKey,
          traslados: res.data ?? [],
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
            traslados: [],
            meta: initialMeta,
            error: 'No se pudieron cargar los traslados.',
          })
        }
      }
    }

    fetchTraslados()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [requestKey, page, estado])

  const setEstado = useCallback((val: EstadoTraslado | undefined) => {
    setEstadoState(val)
    setPage(1)
  }, [])

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

  const traslados = useMemo(
    () => (isCurrent ? result.traslados : []),
    [isCurrent, result.traslados],
  )

  const filteredTraslados = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return traslados
    return traslados.filter((t) => {
      const origen = t.sucursalOrigen?.nombreSucursal?.toLowerCase() ?? ''
      const destino = t.sucursalDestino?.nombreSucursal?.toLowerCase() ?? ''
      const motivo = t.motivo?.toLowerCase() ?? ''
      return (
        origen.includes(query) ||
        destino.includes(query) ||
        motivo.includes(query) ||
        String(t.idTraslado).includes(query)
      )
    })
  }, [traslados, search])

  return {
    filteredTraslados,
    meta: isCurrent ? result.meta : initialMeta,
    isLoading: !isCurrent,
    error: isCurrent ? result.error : null,
    estado,
    setEstado,
    search,
    setSearch,
    page,
    changePage,
    refresh,
  }
}
