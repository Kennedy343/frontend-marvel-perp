import { isAxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useDraftState } from '../../../hooks/useDraftState'
import { buildDraftKey } from '../../../lib/draftStorage'
import { compraService } from '../services/compraService'
import { precioService } from '../../precios/services/precioService'
import { productoService } from '../../inventario/services/productoService'
import {
  PRICE_INPUT_REGEX,
  round2,
  safeCalculatePrecio,
} from '../utils/precios'
import { getNowISO } from '../utils/fecha'
import type { Producto } from '../../inventario/types/producto'
import type { TipoPrecio } from '../../precios/types/precio'
import type {
  CompraFormData,
  CompraFormErrors,
  CompraProducto,
  CompraProveedor,
  CompraSucursal,
  CreateCompraPayload,
  CreateDetalleCompraPayload,
  DetalleCompraFormData,
  DetalleCompraFormErrors,
  DetalleCompraPatch,
  DetallePrecioMargen,
} from '../types/compra'

const MIN_PRODUCTO_QUERY_LENGTH = 3
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300
const PRODUCTO_SEARCH_LIMIT = 20

function toCompraProducto(producto: Producto): CompraProducto {
  return {
    idProducto: producto.idProducto,
    codigoProducto: producto.codigoProducto,
    nombreProducto: producto.nombreProducto,
    ultimoCosto: Number(producto.ultimoCosto) || 0,
  }
}


const initialFormData: CompraFormData = {
  serieFactura: '',
  numeroFactura: '',
  idProveedor: '',
  idSucursal: '',
  detalles: [],
}

const emptyDetalle: DetalleCompraFormData = {
  idDetalleTemporal: 0,
  idProducto: '',
  cantidad: '',
  precioCostoUnitario: '',
  márgenes: [],
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data) {
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join('. ')
      }
      if (typeof data.message === 'string') {
        return data.message
      }
      if (typeof data.error === 'string') {
        return data.error
      }
    }
    if (error.response?.status === 409) {
      return 'Ya existe una compra registrada con esa serie y número para este proveedor.'
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para crear compras en esa sucursal (403).'
    }
    if (error.response?.status === 401) {
      return 'Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.'
    }
    if (error.response?.status === 404) {
      return 'El endpoint /compras no fue encontrado en el servidor (404).'
    }
    if (error.response?.status === 400) {
      return 'Datos inválidos según el servidor (400 Bad Request).'
    }
    return error.message || 'Error de comunicación con el servidor.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrió un error inesperado al registrar la compra.'
}

export function useCreateCompra() {
  const user = useAuthStore((s) => s.user)

  const draftFormKey = user?.id != null ? buildDraftKey(user.id, 'compras', 'form') : null
  const draftDetalleKey = user?.id != null ? buildDraftKey(user.id, 'compras', 'detalle') : null

  const [formData, setFormData, formDraft] = useDraftState(draftFormKey, initialFormData)
  const [headerErrors, setHeaderErrors] = useState<CompraFormErrors>({})
  const [detalleErrors, setDetalleErrors] = useState<DetalleCompraFormErrors>({})
  const [detalleInput, setDetalleInput, detalleDraft] = useDraftState(
    draftDetalleKey,
    emptyDetalle,
  )

  // Desestructurar el meta para mantener callbacks estables.
  const { restoredAt: formDraftRestoredAt, discardDraft: discardFormDraft } = formDraft
  const { restoredAt: detalleDraftRestoredAt, discardDraft: discardDetalleDraft } =
    detalleDraft
  const [proveedores, setProveedores] = useState<CompraProveedor[]>([])
  const [sucursales, setSucursales] = useState<CompraSucursal[]>([])
  const [productos, setProductos] = useState<CompraProducto[]>([])
  const [productoSearchTerm, setProductoSearchTerm] = useState('')
  const [isSearchingProductos, setIsSearchingProductos] = useState(false)
  const [tiposPrecio, setTiposPrecio] = useState<TipoPrecio[]>([])
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        setIsLoadingCatalogs(true)
        const [prov, suc, tipos] = await Promise.all([
          compraService.getProveedores(),
          compraService.getSucursales(),
          precioService.getTiposPrecio().catch(() => [] as TipoPrecio[]),
        ])
        if (isMounted) {
          setProveedores(prov)
          setSucursales(suc)
          setTiposPrecio(tipos)
        }
      } catch (err) {
        console.error('Error al cargar catálogos de compra:', err)
        if (isMounted) {
          setFeedbackError('No se pudieron cargar los catálogos. Intente nuevamente.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalogs(false)
        }
      }
    }

    loadCatalogs()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const query = productoSearchTerm.trim()

    const timeout = window.setTimeout(async () => {
      if (query.length < MIN_PRODUCTO_QUERY_LENGTH) {
        if (!cancelled) {
          setProductos([])
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
        if (!cancelled) {
          setProductos((res.data ?? []).map(toCompraProducto))
        }
      } catch (err) {
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error buscando productos de compra:', err)
        }
      } finally {
        if (!cancelled) {
          setIsSearchingProductos(false)
        }
      }
    }, PRODUCTO_SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [productoSearchTerm])

  const handleProductoSearchChange = useCallback((value: string) => {
    setProductoSearchTerm(value)
  }, [])

  const handleChange = useCallback(
    (field: keyof Omit<CompraFormData, 'detalles'>, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setHeaderErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
      setFeedbackError(null)
    },
    [setFormData],
  )

  const handleDetalleInputChange = useCallback(
    (field: keyof Omit<DetalleCompraFormData, 'idDetalleTemporal' | 'márgenes' | 'producto'>, value: string) => {
      setDetalleInput((prev) => {
        const next = { ...prev, [field]: value }
        if (field === 'precioCostoUnitario') {
          if (next.márgenes && next.márgenes.length > 0) {
            next.márgenes = next.márgenes.map((m) => ({
              ...m,
              precioVentaCalculado: safeCalculatePrecio(value, m.porcentajeMargen),
            }))
          }
        }
        return next
      })
      setDetalleErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
      setFeedbackError(null)
    },
    [setDetalleInput],
  )

  const handleMargenChange = useCallback(
    (idTipoPrecio: number, nuevoMargen: string) => {
      setDetalleInput((prev) => {
        const updatedMárgenes = (prev.márgenes || []).map((m) => {
          if (m.idTipoPrecio === idTipoPrecio) {
            return {
              ...m,
              porcentajeMargen: nuevoMargen,
              precioVentaCalculado: safeCalculatePrecio(prev.precioCostoUnitario, nuevoMargen),
            }
          }
          return m
        })
        return { ...prev, márgenes: updatedMárgenes }
      })
    },
    [setDetalleInput],
  )

  const handleSelectProducto = useCallback(
    async (producto: CompraProducto | null, esNuevo = false) => {
      const idProducto = producto ? String(producto.idProducto) : ''
      const rawCosto = producto ? Number(producto.ultimoCosto) || 0 : 0
      const initialCostoStr = rawCosto > 0 ? String(rawCosto) : ''

      let initialMárgenes: DetallePrecioMargen[] = tiposPrecio.map((tipo) => ({
        idTipoPrecio: tipo.idTipoPrecio,
        nombreTipoPrecio: tipo.nombreTipoPrecio,
        porcentajeMargen: '',
        precioVentaCalculado: safeCalculatePrecio(rawCosto, 0),
      }))

      if (idProducto && !esNuevo) {
        try {
          const idSucursalNum = Number(formData.idSucursal) || undefined
          const existingPrecios = await precioService.getPreciosByProducto(Number(idProducto), idSucursalNum)
          if (existingPrecios.length > 0) {
            initialMárgenes = tiposPrecio.map((tipo) => {
              const match = existingPrecios.find((ep) => ep.idTipoPrecio === tipo.idTipoPrecio)
              const margenStr = match && match.porcentajeMargen != null ? String(match.porcentajeMargen) : ''
              return {
                idTipoPrecio: tipo.idTipoPrecio,
                nombreTipoPrecio: tipo.nombreTipoPrecio,
                porcentajeMargen: margenStr,
                precioVentaCalculado: safeCalculatePrecio(rawCosto, margenStr),
              }
            })
          }
        } catch {
          // Si falla, se usan los defaults
        }
      }

      setDetalleInput((prev) => {
        const esLimpieza = !idProducto
        const costoBase = esLimpieza ? 0 : initialCostoStr || prev.precioCostoUnitario
        const costoBaseStr = esLimpieza ? '' : String(costoBase)
        return {
          ...prev,
          idProducto,
          producto: producto ?? undefined,
          cantidad: esLimpieza ? '' : prev.cantidad,
          precioCostoUnitario: costoBaseStr,
          márgenes: initialMárgenes.map((m) => ({
            ...m,
            precioVentaCalculado: safeCalculatePrecio(costoBase, m.porcentajeMargen),
          })),
        }
      })
      setDetalleErrors((prev) =>
        prev.idProducto ? { ...prev, idProducto: undefined } : prev,
      )
      setFeedbackError(null)
    },
    [tiposPrecio, formData.idSucursal, setDetalleInput],
  )

  const validateDetalle = useCallback((): boolean => {
    const newErrors: DetalleCompraFormErrors = {}

    if (!detalleInput.idProducto) {
      newErrors.idProducto = 'Debe seleccionar un producto.'
    }
    const cantidad = Number(detalleInput.cantidad)
    if (!detalleInput.cantidad || !Number.isInteger(cantidad) || cantidad < 1) {
      newErrors.cantidad = 'La cantidad debe ser un entero mayor o igual a 1.'
    }
    const precio = Number(detalleInput.precioCostoUnitario)
    if (
      !detalleInput.precioCostoUnitario ||
      Number.isNaN(precio) ||
      precio <= 0 ||
      !PRICE_INPUT_REGEX.test(detalleInput.precioCostoUnitario)
    ) {
      newErrors.precioCostoUnitario = 'El precio de costo debe ser mayor a 0 y con hasta 2 decimales.'
    }

    const margenVacio = detalleInput.márgenes?.some(
      (m) => String(m.porcentajeMargen).trim() === '',
    )
    if (!detalleInput.márgenes || detalleInput.márgenes.length === 0 || margenVacio) {
      newErrors.márgenes = 'Complete todos los márgenes de precio antes de agregar el ítem.'
    }

    setDetalleErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [detalleInput])

  const agregarDetalle = useCallback((): boolean => {
    if (!validateDetalle()) {
      return false
    }
    const idDetalleTemporal = Date.now() + Math.random()
    setFormData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { ...detalleInput, idDetalleTemporal }],
    }))
    setDetalleInput(emptyDetalle)
    setDetalleErrors({})
    return true
  }, [detalleInput, validateDetalle, setFormData, setDetalleInput])

  const quitarDetalle = useCallback((idDetalleTemporal: number) => {
    setFormData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter(
        (detalle) => detalle.idDetalleTemporal !== idDetalleTemporal,
      ),
    }))
  }, [setFormData])

  const updateDetalle = useCallback(
    (idDetalleTemporal: number, patch: DetalleCompraPatch) => {
      setFormData((prev) => ({
        ...prev,
        detalles: prev.detalles.map((detalle) => {
          if (detalle.idDetalleTemporal !== idDetalleTemporal) return detalle
          const next = { ...detalle, ...patch }
          const costo = Number(next.precioCostoUnitario) || 0
          return {
            ...next,
            márgenes: next.márgenes?.map((margen) => ({
              ...margen,
              precioVentaCalculado: safeCalculatePrecio(
                costo,
                margen.porcentajeMargen,
              ),
            })),
          }
        }),
      }))
    },
    [setFormData],
  )

  const validateHeader = useCallback((): boolean => {
    const newErrors: CompraFormErrors = {}

    if (!formData.serieFactura.trim()) {
      newErrors.serieFactura = 'La serie de la factura es obligatoria.'
    } else if (formData.serieFactura.trim().length > 20) {
      newErrors.serieFactura = 'La serie no debe superar los 20 caracteres.'
    }

    if (!formData.numeroFactura.trim()) {
      newErrors.numeroFactura = 'El número de factura es obligatorio.'
    } else if (formData.numeroFactura.trim().length > 50) {
      newErrors.numeroFactura = 'El número no debe superar los 50 caracteres.'
    }

    if (!formData.idProveedor) {
      newErrors.idProveedor = 'Debe seleccionar un proveedor.'
    }

    if (!formData.idSucursal) {
      newErrors.idSucursal = 'Debe seleccionar una sucursal.'
    }

    setHeaderErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const draftRestoredAt = useMemo(() => {
    const times = [formDraftRestoredAt, detalleDraftRestoredAt].filter(
      (t): t is number => t != null,
    )
    return times.length > 0 ? Math.max(...times) : null
  }, [formDraftRestoredAt, detalleDraftRestoredAt])

  const discardDraft = useCallback(() => {
    discardFormDraft()
    discardDetalleDraft()
    setHeaderErrors({})
    setDetalleErrors({})
    setFeedbackError(null)
  }, [discardFormDraft, discardDetalleDraft])

  const handleSubmit = async (onSuccess?: () => void) => {
    if (!validateHeader()) {
      setFeedbackError('Por favor complete todos los campos obligatorios de la cabecera.')
      return false
    }
    if (formData.detalles.length === 0) {
      setFeedbackError('Debe agregar al menos un detalle de producto a la compra.')
      return false
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      const idSucursalNum = Number(formData.idSucursal)

      const detalles: CreateDetalleCompraPayload[] = formData.detalles.map(
        (d) => ({
          idProducto: Number(d.idProducto),
          cantidad: Number(d.cantidad),
          precioCostoUnitario: round2(Number(d.precioCostoUnitario)),
        }),
      )

      const payload: CreateCompraPayload = {
        serieFactura: formData.serieFactura.trim(),
        numeroFactura: formData.numeroFactura.trim(),
        idProveedor: Number(formData.idProveedor),
        idSucursal: idSucursalNum,
        fechaCompra: getNowISO(),
        detalles,
      }

      await compraService.create(payload)

      // Guardar márgenes y precios calculados para cada producto en la sucursal de la compra
      const preciosToSave = formData.detalles.flatMap((detalle) => {
        if (!detalle.márgenes) return []
        return detalle.márgenes.map((m) => ({
          idProducto: Number(detalle.idProducto),
          idTipoPrecio: m.idTipoPrecio,
          idSucursal: idSucursalNum,
          porcentajeMargen: Number(m.porcentajeMargen),
        }))
      })

      if (preciosToSave.length > 0) {
        try {
          await precioService.savePreciosBatch(preciosToSave)
        } catch (precioErr) {
          console.warn('Aviso: La compra se registró pero algunos precios no pudieron sincronizarse:', precioErr)
        }
      }

      setIsSuccess(true)

      discardDraft()

      if (onSuccess) {
        onSuccess()
      }
      return true
    } catch (err) {
      console.error('Error al crear compra:', err)
      setFeedbackError(extractErrorMessage(err))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = useCallback(() => {
    discardDraft()
    setProductoSearchTerm('')
    setProductos([])
    setIsSuccess(false)
  }, [discardDraft])

  const appendProducto = useCallback((nuevo: CompraProducto) => {
    setProductos((prev) => [nuevo, ...prev])
  }, [])

  return {
    formData,
    headerErrors,
    detalleErrors,
    detalleInput,
    proveedores,
    sucursales,
    productos,
    tiposPrecio,
    isLoadingCatalogs,
    isSearchingProductos,
    isSubmitting,
    isSuccess,
    feedbackError,
    draftRestoredAt,
    discardDraft,
    handleChange,
    handleDetalleInputChange,
    handleMargenChange,
    handleProductoSearchChange,
    handleSelectProducto,
    appendProducto,
    agregarDetalle,
    quitarDetalle,
    updateDetalle,
    validateHeader,
    handleSubmit,
    resetForm,
  }
}
