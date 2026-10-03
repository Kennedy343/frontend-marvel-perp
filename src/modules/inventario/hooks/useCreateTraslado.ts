import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../../../store/authStore'
import { useDraftState } from '../../../hooks/useDraftState'
import { buildDraftKey } from '../../../lib/draftStorage'
import { useSucursalScope } from '../../../hooks/useSucursalScope'
import { trasladoService } from '../services/trasladoService'
import { inventarioSucursalService } from '../services/inventarioSucursalService'
import { productoService } from '../services/productoService'
import type {
  CreateTrasladoPayload,
  Traslado,
  TrasladoDetalleFormData,
  TrasladoFormData,
  TrasladoFormErrors,
} from '../types/traslado'
import type { Producto } from '../types/producto'
import type { SucursalInventario } from '../types/inventarioSucursal'
import { getStockEnSucursal } from '../lib/stock'

const emptyForm: TrasladoFormData = {
  idSucursalOrigen: '',
  idSucursalDestino: '',
  motivo: '',
  detalles: [],
}

const MIN_PRODUCTO_QUERY_LENGTH = 3
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300
const PRODUCTO_SEARCH_LIMIT = 20

function extractSubmitError(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data.message === 'string') return data.message
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join('. ')
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para crear traslados desde esta sucursal.'
    }
    if (error.response?.status === 404) {
      return 'La sucursal o el producto seleccionado no existe.'
    }
  }
  return 'No se pudo crear el traslado. Intente nuevamente.'
}

export function useCreateTraslado() {
  const user = useAuthStore((s) => s.user)
  const { sucursalesPropias, sucursalFija } = useSucursalScope()

  const isRestricted = sucursalesPropias.length > 0

  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])
  const [productoResultados, setProductoResultados] = useState<Producto[]>([])
  const [productoSearchTerm, setProductoSearchTerm] = useState('')
  const [isSearchingProductos, setIsSearchingProductos] = useState(false)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const draftFormKey = user?.id != null ? buildDraftKey(user.id, 'traslados', 'form') : null
  const [form, setForm, formDraft] = useDraftState<TrasladoFormData>(draftFormKey, {
    ...emptyForm,
    idSucursalOrigen: sucursalFija ? String(sucursalFija.idSucursal) : '',
  })
  const { restoredAt: formDraftRestoredAt, discardDraft: discardFormDraft } = formDraft
  const [errors, setErrors] = useState<TrasladoFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)


  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function loadSucursales() {
      setIsLoadingCatalogs(true)
      try {
        const sucursalesData = isRestricted
          ? sucursalesPropias
          : await inventarioSucursalService.getSucursales(controller.signal)
        if (ignore) return
        setSucursales(sucursalesData)
      } catch (err: unknown) {
        if (
          !ignore &&
          (err as Error).name !== 'CanceledError' &&
          (err as Error).name !== 'AbortError'
        ) {
          console.error('Error cargando sucursales de traslado:', err)
        }
      } finally {
        if (!ignore) setIsLoadingCatalogs(false)
      }
    }

    loadSucursales()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [isRestricted, sucursalesPropias])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
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
        const res = await productoService.getAll(
          {
            search: query,
            limit: PRODUCTO_SEARCH_LIMIT,
            scopeSucursal: true,
          },
          controller.signal,
        )
        if (!cancelled) setProductoResultados(res.data)
      } catch (err) {
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error buscando productos de traslado:', err)
        }
      } finally {
        if (!cancelled) setIsSearchingProductos(false)
      }
    }, PRODUCTO_SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [productoSearchTerm])

  const setField = useCallback(
    <K extends keyof TrasladoFormData>(field: K, value: TrasladoFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    [setForm],
  )

  const addDetalle = useCallback(() => {
    setForm((prev) => {
      const nextId =
        prev.detalles.reduce(
          (max, detalle) => Math.max(max, detalle.idDetalleTemporal),
          0,
        ) + 1
      const nuevo: TrasladoDetalleFormData = {
        idDetalleTemporal: nextId,
        idProducto: '',
        cantidad: '1',
      }
      return { ...prev, detalles: [...prev.detalles, nuevo] }
    })
    setErrors((prev) => ({ ...prev, detalles: undefined }))
  }, [setForm])

  const updateDetalle = useCallback(
    (idDetalleTemporal: number, patch: Partial<TrasladoDetalleFormData>) => {
      setForm((prev) => ({
        ...prev,
        detalles: prev.detalles.map((d) =>
          d.idDetalleTemporal === idDetalleTemporal ? { ...d, ...patch } : d,
        ),
      }))
      setErrors((prev) => ({ ...prev, detalles: undefined }))
    },
    [setForm],
  )

  const removeDetalle = useCallback((idDetalleTemporal: number) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter(
        (d) => d.idDetalleTemporal !== idDetalleTemporal,
      ),
    }))
  }, [setForm])

  const selectProducto = useCallback(
    (idDetalleTemporal: number, idProducto: number) => {
      setForm((prev) => ({
        ...prev,
        detalles: prev.detalles.map((d) => {
          if (d.idDetalleTemporal !== idDetalleTemporal) return d
          const producto =
            productoResultados.find((p) => p.idProducto === idProducto) ??
            (d.producto?.idProducto === idProducto ? d.producto : undefined)
          return { ...d, idProducto: String(idProducto), producto }
        }),
      }))
      setProductoSearchTerm('')
      setProductoResultados([])
      setErrors((prev) => ({ ...prev, detalles: undefined }))
    },
    [productoResultados, setForm],
  )

  const clearProducto = useCallback((idDetalleTemporal: number) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d) =>
        d.idDetalleTemporal === idDetalleTemporal
          ? { ...d, idProducto: '', producto: undefined }
          : d,
      ),
    }))
    setErrors((prev) => ({ ...prev, detalles: undefined }))
  }, [setForm])

  const validate = useCallback((): TrasladoFormErrors => {
    const next: TrasladoFormErrors = {}

    if (!form.idSucursalOrigen) {
      next.idSucursalOrigen = 'Seleccione la sucursal de origen.'
    }
    if (!form.idSucursalDestino) {
      next.idSucursalDestino = 'Seleccione la sucursal de destino.'
    }
    if (
      form.idSucursalOrigen &&
      form.idSucursalDestino &&
      form.idSucursalOrigen === form.idSucursalDestino
    ) {
      next.idSucursalDestino =
        'La sucursal de destino debe ser diferente a la de origen.'
    }

    if (form.detalles.length === 0) {
      next.detalles = 'Agregue al menos un producto al traslado.'
    } else {
      const ids = form.detalles.map((d) => d.idProducto).filter(Boolean)
      if (ids.length !== form.detalles.length) {
        next.detalles = 'Seleccione un producto en cada línea.'
      } else if (ids.some((id) => Number(id) <= 0)) {
        next.detalles = 'Seleccione un producto válido en cada línea.'
      } else if (new Set(ids).size !== ids.length) {
        next.detalles = 'No se puede repetir el mismo producto en el traslado.'
      } else if (form.detalles.some((d) => Number(d.cantidad) <= 0 || d.cantidad === '')) {
        next.detalles = 'La cantidad de cada producto debe ser mayor a 0.'
      } else if (form.idSucursalOrigen) {
        const idSucursalOrigen = Number(form.idSucursalOrigen)
        const stockInsuficiente = form.detalles.some((detalle) => {
          const stock = getStockEnSucursal(detalle.producto, idSucursalOrigen)
          return stock !== null && Number(detalle.cantidad) > stock
        })
        if (stockInsuficiente) {
          next.detalles =
            'La cantidad de uno o más productos supera el stock disponible en la sucursal de origen.'
        }
      }
    }

    return next
  }, [form])

  const discardDraft = useCallback(() => {
    discardFormDraft()
    setErrors({})
    setSubmitError(null)
    setProductoResultados([])
    setProductoSearchTerm('')
  }, [discardFormDraft])

  const submit = useCallback(async (): Promise<Traslado | null> => {
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return null

    const payload: CreateTrasladoPayload = {
      idSucursalOrigen: Number(form.idSucursalOrigen),
      idSucursalDestino: Number(form.idSucursalDestino),
      ...(form.motivo.trim() ? { motivo: form.motivo.trim() } : {}),
      detalles: form.detalles.map((d) => ({
        idProducto: Number(d.idProducto),
        cantidad: Number(d.cantidad),
      })),
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const traslado = await trasladoService.create(payload)
      discardDraft()
      return traslado
    } catch (err) {
      console.error('Error al crear traslado:', err)
      setSubmitError(extractSubmitError(err))
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [form, validate, discardDraft])

  return {
    form,
    errors,
    setField,
    addDetalle,
    updateDetalle,
    removeDetalle,
    selectProducto,
    clearProducto,
    sucursales,
    productoResultados,
    productoSearchTerm,
    setProductoSearchTerm,
    isSearchingProductos,
    isLoadingCatalogs,
    isSubmitting,
    submitError,
    draftRestoredAt: formDraftRestoredAt,
    discardDraft,
    submit,
  }
}
