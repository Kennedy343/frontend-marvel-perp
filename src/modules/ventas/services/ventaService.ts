import api from '../../../lib/axios'
import type {
  Venta,
  VentasResponse,
  VentasFilters,
  CreateVentaDto,
  FacturarVentaDto,
  AnularVentaDto,
  AgregarDetalleVentaDto,
  ActualizarDetalleVentaDto,
  EstadisticasVenta,
  EstadisticasParams,
} from '../types/venta'

export const ventaService = {
  async getAll(filters: VentasFilters = {}, signal?: AbortSignal): Promise<VentasResponse> {
    const params: Record<string, string | number | boolean> = {}

    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    if (filters.search) params.search = filters.search
    if (filters.idCliente) params.idCliente = filters.idCliente
    if (filters.idSucursal) params.idSucursal = filters.idSucursal
    if (filters.ventaActiva !== undefined) params.ventaActiva = filters.ventaActiva
    if (filters.facturada !== undefined) params.facturada = filters.facturada

    const { data } = await api.get<VentasResponse>('/ventas', {
      params,
      signal,
    })
    return data
  },

  async getById(id: number, signal?: AbortSignal): Promise<Venta> {
    const { data } = await api.get<Venta>(`/ventas/${id}`, { signal })
    return data
  },

  async getEstadisticas(
    params: EstadisticasParams = {},
    signal?: AbortSignal,
  ): Promise<EstadisticasVenta> {
    const query: Record<string, string | number> = {}
    if (params.periodo) query.periodo = params.periodo
    if (params.idSucursal) query.idSucursal = params.idSucursal

    const { data } = await api.get<EstadisticasVenta>('/ventas/estadisticas', {
      params: query,
      signal,
    })
    return data
  },

  async create(payload: CreateVentaDto): Promise<Venta> {
    const { data } = await api.post<Venta>('/ventas', payload)
    return data
  },

  async facturar(id: number, payload: FacturarVentaDto): Promise<Venta> {
    const { data } = await api.patch<Venta>(`/ventas/${id}/facturar`, payload)
    return data
  },

  async anular(id: number, payload: AnularVentaDto): Promise<Venta> {
    const { data } = await api.patch<Venta>(`/ventas/${id}/anular`, payload)
    return data
  },

  async agregarDetalle(idVenta: number, payload: AgregarDetalleVentaDto): Promise<Venta> {
    const { data } = await api.post<Venta>(`/ventas/${idVenta}/detalles`, payload)
    return data
  },

  async actualizarDetalle(
    idVenta: number,
    idDetalle: number,
    payload: ActualizarDetalleVentaDto,
  ): Promise<Venta> {
    const { data } = await api.patch<Venta>(
      `/ventas/${idVenta}/detalles/${idDetalle}`,
      payload,
    )
    return data
  },

  async eliminarDetalle(idVenta: number, idDetalle: number): Promise<Venta> {
    const { data } = await api.delete<Venta>(`/ventas/${idVenta}/detalles/${idDetalle}`)
    return data
  },
}
