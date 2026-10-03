import { useState, useEffect, useCallback, useMemo } from 'react'
import { isAxiosError } from 'axios'
import { useSucursalScope } from '../../../hooks/useSucursalScope'
import { ventaService } from '../services/ventaService'
import { clientService } from '../../crm/services/clientService'
import { precioService } from '../../precios/services/precioService'
import { inventarioSucursalService } from '../../inventario/services/inventarioSucursalService'
import { productoService } from '../../inventario/services/productoService'
import type { DetalleVentaItemDto, CreateVentaDto } from '../types/venta'
import type { Client } from '../../crm/types/client'
import type { SucursalInventario } from '../../inventario/types/inventarioSucursal'
import type { Producto } from '../../inventario/types/producto'
import type { TipoPrecio, ProductoPrecio } from '../../precios/types/precio'
import { useDraftState } from '../../../hooks/useDraftState'
import { buildDraftKey } from '../../../lib/draftStorage'
import { useAuthStore } from '../../../store/authStore'

export type SucursalVentaMode = 'auto' | 'select-propio' | 'select-todas'

export interface OpcionPrecio {
  idTipoPrecio: number
  nombreTipoPrecio: string
  precioVenta: number
}

export interface DetalleVentaRow extends DetalleVentaItemDto {
  tempId: string
  producto?: Producto
  tipoPrecio?: TipoPrecio
  precioUnitario: number
  subtotal: number
  stockDisponible?: number
  opcionesPrecio: OpcionPrecio[]
}

const MIN_PRODUCTO_QUERY_LENGTH = 3
const PRODUCTO_SEARCH_DEBOUNCE_MS = 300
const PRODUCTO_SEARCH_LIMIT = 20

export function useCreateVenta() {
  const user = useAuthStore((s) => s.user)

  // Sucursales y scope global del usuario (sucursal activa del gate/header)
  const {
    sucursalesPropias,
    mode: sucursalMode,
    sucursalFija,
  } = useSucursalScope()

  // Catálogos
  const [clientes, setClientes] = useState<Client[]>([])
  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [tiposPrecio, setTiposPrecio] = useState<TipoPrecio[]>([])
  const [preciosSucursal, setPreciosSucursal] = useState<ProductoPrecio[]>([])
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)

  // Búsqueda de productos (en servidor, scoped a las sucursales del usuario)
  const [productoSearchTerm, setProductoSearchTerm] = useState('')
  const [isSearchingProductos, setIsSearchingProductos] = useState(false)

  // Cabecera de la venta
  const draftFormKey = user?.id != null ? buildDraftKey(user.id, 'ventas', 'form') : null
  const draftClienteKey = user?.id != null ? buildDraftKey(user.id, 'ventas', 'cliente') : null
  const draftDetallesKey = user?.id != null ? buildDraftKey(user.id, 'ventas', 'detalles') : null

  const initialFormData = useMemo(
    () => ({
      idCliente: '',
      idSucursal:
        sucursalMode === 'auto' && sucursalesPropias.length === 1
          ? String(sucursalesPropias[0].idSucursal)
          : '',
      fechaVenta: new Date().toISOString().split('T')[0],
    }),
    [sucursalMode, sucursalesPropias],
  )

  const [formData, setFormData, formDraft] = useDraftState(draftFormKey, initialFormData)

  // Sucursal efectiva: fija cuando el scope es automático, elegida por el usuario en otro caso
  const idSucursalValue =
    sucursalMode === 'auto' && sucursalFija
      ? String(sucursalFija.idSucursal)
      : formData.idSucursal

  // Búsqueda de clientes (en servidor)
  const [clienteSearchTerm, setClienteSearchTerm, clienteDraft] = useDraftState(
    draftClienteKey,
    '',
  )
  const [isSearchingClientes, setIsSearchingClientes] = useState(false)

  // Detalle actual en edición / entrada
  const [detalleInput, setDetalleInput] = useState({
    idProducto: '',
    idTipoPrecio: '',
    cantidad: '1',
  })

  // Array de detalles acumulados
  const [detalles, setDetalles, detallesDraft] = useDraftState<DetalleVentaRow[]>(
    draftDetallesKey,
    [],
  )

  // Desestructurar el meta de cada borrador para mantener callbacks estables.
  const { restoredAt: formDraftRestoredAt, discardDraft: discardFormDraft } = formDraft
  const { restoredAt: clienteDraftRestoredAt, discardDraft: discardClienteDraft } =
    clienteDraft
  const { restoredAt: detallesDraftRestoredAt, discardDraft: discardDetallesDraft } =
    detallesDraft

  // Errores y estados
  const [headerErrors, setHeaderErrors] = useState<Record<string, string>>({})
  const [detalleErrors, setDetalleErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  // Carga inicial de catálogos generales en paralelo
  useEffect(() => {
    const controller = new AbortController()

    async function loadInitialCatalogs() {
      setIsLoadingCatalogs(true)
      try {
        const tiposPrecioRes = await precioService.getTiposPrecio()

        setTiposPrecio(tiposPrecioRes || [])
      } catch (err) {
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error cargando catálogos para venta:', err)
        }
      } finally {
        setIsLoadingCatalogs(false)
      }
    }

    loadInitialCatalogs()

    return () => {
      controller.abort()
    }
  }, [])

  // Resolver el listado de sucursales permitidas para el usuario
  useEffect(() => {
    const controller = new AbortController()

    async function loadSucursales() {
      if (sucursalMode === 'select-todas') {
        const res = await inventarioSucursalService.getSucursales(controller.signal)
        setSucursales(res || [])
      } else {
        setSucursales(sucursalesPropias)
      }
    }

    loadSucursales()

    return () => {
      controller.abort()
    }
  }, [sucursalMode, sucursalesPropias])

  // Búsqueda de clientes en servidor con debounce
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const query = clienteSearchTerm.trim()

    const timeout = window.setTimeout(async () => {
      try {
        if (query.length < 2) {
          if (!cancelled) {
            setClientes([])
            setIsSearchingClientes(false)
          }
          return
        }
        setIsSearchingClientes(true)
        const res = await clientService.getAll(
          { search: query, limit: 30 },
          controller.signal,
        )
        if (!cancelled) {
          setClientes(res.data || [])
        }
      } catch (err) {
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error buscando clientes:', err)
        }
      } finally {
        if (!cancelled) {
          setIsSearchingClientes(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [clienteSearchTerm])

  // Búsqueda de productos en servidor con debounce, scoped a las sucursales del usuario
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const query = productoSearchTerm.trim()

    const timeout = window.setTimeout(async () => {
      try {
        if (query.length < MIN_PRODUCTO_QUERY_LENGTH) {
          if (!cancelled) {
            setProductos([])
            setIsSearchingProductos(false)
          }
          return
        }
        setIsSearchingProductos(true)
        const res = await productoService.getAll(
          {
            search: query,
            limit: PRODUCTO_SEARCH_LIMIT,
            scopeSucursal: true,
          },
          controller.signal,
        )
        if (!cancelled) {
          setProductos(res.data || [])
        }
      } catch (err) {
        if (!isAxiosError(err) || err.code !== 'ERR_CANCELED') {
          console.error('Error buscando productos:', err)
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

  // Al cambiar el producto seleccionado en el detalle, obtener sus precios configurados
  useEffect(() => {
    const idProd = Number(detalleInput.idProducto)
    const idSuc = Number(idSucursalValue)
    let ignore = false

    async function loadProductPrices() {
      try {
        if (!idProd || !idSuc) {
          if (!ignore) setPreciosSucursal([])
          return
        }
        const prices = await precioService.getPreciosByProducto(idProd, idSuc)
        if (ignore) return
        setPreciosSucursal(prices || [])
        // Si no hay tipo de precio seleccionado o el actual no está en la lista, auto-seleccionar el primero disponible
        if (prices && prices.length > 0) {
          setDetalleInput((prev) => {
            if (!prev.idTipoPrecio || !prices.some((p) => p.idTipoPrecio === Number(prev.idTipoPrecio))) {
              return { ...prev, idTipoPrecio: String(prices[0].idTipoPrecio) }
            }
            return prev
          })
        }
      } catch (err) {
        if (!ignore) console.error('Error al cargar precios del producto:', err)
      }
    }

    loadProductPrices()
    return () => {
      ignore = true
    }
  }, [detalleInput.idProducto, idSucursalValue])

  const handleHeaderChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHeaderErrors((prev) => {
      if (!prev[field]) return prev
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
    setFeedbackError(null)
  }, [setFormData])

  const handleDetalleInputChange = useCallback((field: string, value: string) => {
    setDetalleInput((prev) => ({ ...prev, [field]: value }))
    setDetalleErrors((prev) => {
      if (!prev[field]) return prev
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
    setFeedbackError(null)
  }, [])

  const handleClienteSelect = useCallback((idCliente: string) => {
    const cliente = clientes.find((c) => String(c.idCliente) === idCliente)
    if (cliente) {
      const fullName = `${cliente.primerNombre} ${cliente.segundoNombre || ''} ${cliente.primerApellido} ${cliente.segundoApellido || ''}`
        .replace(/\s+/g, ' ')
        .trim()
      setClienteSearchTerm(fullName)
    }
    setFormData((prev) => ({ ...prev, idCliente }))
    setHeaderErrors((prev) => {
      if (!prev.idCliente) return prev
      const updated = { ...prev }
      delete updated.idCliente
      return updated
    })
    setFeedbackError(null)
  }, [clientes, setClienteSearchTerm, setFormData])

  const appendCliente = useCallback((created: Client) => {
    const fullName = `${created.primerNombre} ${created.segundoNombre || ''} ${created.primerApellido} ${created.segundoApellido || ''}`
      .replace(/\s+/g, ' ')
      .trim()
    setClienteSearchTerm(fullName)
    setClientes((prev) => [created, ...prev])
    setFormData((prev) => ({ ...prev, idCliente: String(created.idCliente) }))
    setHeaderErrors((prev) => {
      if (!prev.idCliente) return prev
      const updated = { ...prev }
      delete updated.idCliente
      return updated
    })
    setFeedbackError(null)
  }, [setClienteSearchTerm, setFormData])

  // Buscar stock disponible para el producto actual en la sucursal seleccionada (solo lectura desde producto.inventarios)
  const currentProductStock = useMemo(() => {
    if (!detalleInput.idProducto || !idSucursalValue) return null
    const idProd = Number(detalleInput.idProducto)
    const idSuc = Number(idSucursalValue)
    const producto = productos.find((p) => p.idProducto === idProd)
    const inv = producto?.inventarios?.find((i) => i.idSucursal === idSuc && i.activo)
    return inv ? inv.stockActual : 0
  }, [detalleInput.idProducto, idSucursalValue, productos])

  // Buscar precio de venta para la combinación de producto, tipo de precio y sucursal
  const currentUnitPrice = useMemo(() => {
    if (!detalleInput.idProducto || !detalleInput.idTipoPrecio) return 0
    const idProd = Number(detalleInput.idProducto)
    const idTipo = Number(detalleInput.idTipoPrecio)

    const precioObj = preciosSucursal.find(
      (p) => p.idProducto === idProd && p.idTipoPrecio === idTipo && p.activo,
    )
    if (!precioObj) return 0
    const parsed = Number(precioObj.precioVenta)
    return isNaN(parsed) ? 0 : parsed
  }, [detalleInput.idProducto, detalleInput.idTipoPrecio, preciosSucursal])

  // Agregar detalle al listado
  const agregarDetalle = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!idSucursalValue) {
      errors.sucursal = 'Debe seleccionar una sucursal primero'
    }
    if (!detalleInput.idProducto) {
      errors.idProducto = 'Seleccione un producto'
    }
    if (!detalleInput.idTipoPrecio) {
      errors.idTipoPrecio = 'Seleccione un tipo de precio'
    }
    const qty = Number(detalleInput.cantidad)
    if (isNaN(qty) || qty <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0'
    }
    if (currentUnitPrice <= 0) {
      errors.idTipoPrecio = 'El producto no tiene precio de venta configurado para esta sucursal y tipo de precio'
    }

    if (Object.keys(errors).length > 0) {
      setDetalleErrors(errors)
      return false
    }

    const idProd = Number(detalleInput.idProducto)
    const idTipo = Number(detalleInput.idTipoPrecio)

    // Si ya está en la lista, sumar la cantidad a la fila existente
    const existingIndex = detalles.findIndex((d) => d.idProducto === idProd)
    if (existingIndex >= 0) {
      setDetalles((prev) =>
        prev.map((d, idx) => {
          if (idx !== existingIndex) return d
          const nuevaCantidad = d.cantidad + qty
          const subtotal = Number((nuevaCantidad * d.precioUnitario).toFixed(2))
          return { ...d, cantidad: nuevaCantidad, subtotal }
        }),
      )
      setDetalleInput({
        idProducto: '',
        idTipoPrecio: '',
        cantidad: '1',
      })
      setDetalleErrors({})
      return true
    }

    const producto = productos.find((p) => p.idProducto === idProd)
    const tipoPrecio = tiposPrecio.find((t) => t.idTipoPrecio === idTipo)
    const precioUnit = currentUnitPrice
    const subtotal = Number((qty * precioUnit).toFixed(2))
    const stockDisp = currentProductStock ?? 0

    const opcionesPrecio: OpcionPrecio[] = preciosSucursal.reduce<OpcionPrecio[]>((acc, p) => {
      if (!p.activo) return acc
      const tp = tiposPrecio.find((t) => t.idTipoPrecio === p.idTipoPrecio)
      acc.push({
        idTipoPrecio: p.idTipoPrecio,
        nombreTipoPrecio: tp?.nombreTipoPrecio ?? `Tipo #${p.idTipoPrecio}`,
        precioVenta: Number(p.precioVenta) || 0,
      })
      return acc
    }, [])

    const newRow: DetalleVentaRow = {
      tempId: `${idProd}-${idTipo}-${Date.now()}`,
      idProducto: idProd,
      idTipoPrecio: idTipo,
      cantidad: qty,
      producto,
      tipoPrecio,
      precioUnitario: precioUnit,
      subtotal,
      stockDisponible: stockDisp,
      opcionesPrecio,
    }

    setDetalles((prev) => [...prev, newRow])
    setDetalleInput({
      idProducto: '',
      idTipoPrecio: '',
      cantidad: '1',
    })
    setDetalleErrors({})
    return true
  }, [
    idSucursalValue,
    detalleInput,
    detalles,
    productos,
    tiposPrecio,
    preciosSucursal,
    currentUnitPrice,
    currentProductStock,
    setDetalles,
  ])

  // Quitar detalle
  const quitarDetalle = useCallback((tempId: string) => {
    setDetalles((prev) => prev.filter((d) => d.tempId !== tempId))
  }, [setDetalles])

  // Actualizar cantidad de un detalle ya agregado
  const actualizarCantidadDetalle = useCallback((tempId: string, cantidad: number) => {
    setDetalles((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId) return d
        const subtotal = Number((cantidad * d.precioUnitario).toFixed(2))
        return { ...d, cantidad, subtotal }
      }),
    )
    setDetalleErrors({})
  }, [setDetalles])

  // Cambiar el tipo de precio de un detalle ya agregado
  const actualizarTipoPrecioDetalle = useCallback((tempId: string, idTipoPrecio: number) => {
    setDetalles((prev) =>
      prev.map((d) => {
        if (d.tempId !== tempId) return d
        const opcion = d.opcionesPrecio.find((o) => o.idTipoPrecio === idTipoPrecio)
        if (!opcion) return d
        const precioUnitario = opcion.precioVenta
        const subtotal = Number((d.cantidad * precioUnitario).toFixed(2))
        const tipoPrecio = tiposPrecio.find((t) => t.idTipoPrecio === idTipoPrecio)
        return { ...d, idTipoPrecio, precioUnitario, subtotal, tipoPrecio }
      }),
    )
    setDetalleErrors({})
  }, [tiposPrecio, setDetalles])

  // Total acumulado
  const totalVenta = useMemo(() => {
    return Number(
      detalles.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2),
    )
  }, [detalles])

  // Borradores restaurados: exponer la fecha más reciente y permitir descartarlos
  const draftRestoredAt = useMemo(() => {
    const times = [
      formDraftRestoredAt,
      clienteDraftRestoredAt,
      detallesDraftRestoredAt,
    ].filter((t): t is number => t != null)
    return times.length > 0 ? Math.max(...times) : null
  }, [formDraftRestoredAt, clienteDraftRestoredAt, detallesDraftRestoredAt])

  const discardDraft = useCallback(() => {
    discardFormDraft()
    discardClienteDraft()
    discardDetallesDraft()
    setDetalleInput({ idProducto: '', idTipoPrecio: '', cantidad: '1' })
  }, [discardFormDraft, discardClienteDraft, discardDetallesDraft])

  // Validar cabecera antes de avanzar a detalles
  const validateHeader = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!formData.idCliente) errors.idCliente = 'Seleccione un cliente'
    if (!idSucursalValue) errors.idSucursal = 'Seleccione una sucursal'
    setHeaderErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData.idCliente, idSucursalValue])

  // Enviar venta completa
  const handleSubmit = useCallback(
    async (onSuccessCallback?: () => void) => {
      setFeedbackError(null)
      if (!validateHeader()) {
        return false
      }
      if (detalles.length === 0) {
        setFeedbackError('Debe agregar al menos un producto a la venta.')
        return false
      }

      setIsSubmitting(true)
      try {
        const payload: CreateVentaDto = {
          idCliente: Number(formData.idCliente),
          idSucursal: Number(idSucursalValue),
          ...(formData.fechaVenta ? { fechaVenta: formData.fechaVenta } : {}),
          detalles: detalles.map((d) => ({
            idProducto: d.idProducto,
            idTipoPrecio: d.idTipoPrecio,
            cantidad: d.cantidad,
          })),
        }

        await ventaService.create(payload)
        setIsSuccess(true)
        discardDraft()
        if (onSuccessCallback) {
          onSuccessCallback()
        }
        return true
      } catch (err: unknown) {
        console.error('Error al registrar venta:', err)
        if (isAxiosError(err)) {
          const msg = err.response?.data?.message
          if (typeof msg === 'string') {
            setFeedbackError(msg)
          } else if (Array.isArray(msg)) {
            setFeedbackError(msg.join('. '))
          } else {
            setFeedbackError('Ocurrió un error al registrar la venta.')
          }
        } else {
          setFeedbackError('Error inesperado al procesar la venta.')
        }
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, idSucursalValue, detalles, validateHeader, discardDraft],
  )

  return {
    clientes,
    sucursales,
    sucursalMode,
    sucursalFija,
    productos,
    tiposPrecio,
    isLoadingCatalogs,
    formData,
    detalleInput,
    detalles,
    totalVenta,
    currentProductStock,
    currentUnitPrice,
    headerErrors,
    detalleErrors,
    isSubmitting,
    isSuccess,
    feedbackError,
    draftRestoredAt,
    discardDraft,
    handleHeaderChange,
    handleDetalleInputChange,
    handleClienteSelect,
    appendCliente,
    clienteSearchTerm,
    setClienteSearchTerm,
    isSearchingClientes,
    productoSearchTerm,
    setProductoSearchTerm,
    isSearchingProductos,
    agregarDetalle,
    quitarDetalle,
    actualizarCantidadDetalle,
    actualizarTipoPrecioDetalle,
    validateHeader,
    handleSubmit,
  }
}
