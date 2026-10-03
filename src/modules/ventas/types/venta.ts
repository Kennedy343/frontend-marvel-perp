import type { Producto } from '../../inventario/types/producto'
import type { TipoPrecio } from '../../precios/types/precio'

export interface VentaCliente {
  idCliente: number
  dpiCliente: string
  nit?: string | null
  primerNombre: string
  segundoNombre?: string | null
  primerApellido: string
  segundoApellido?: string | null
  telefono: string
}

export interface VentaSucursal {
  idSucursal: number
  codigoSucursal: string
  nitSucursal: string
  nombreSucursal: string
}

export interface VentaUsuario {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
}

export interface DetalleVenta {
  idDetalleVenta: number
  idVenta: number
  idProducto: number
  idTipoPrecio: number
  cantidad: number
  precioVenta: number | string
  subtotal: number | string
  producto?: Producto
  tipoPrecio?: TipoPrecio
}

export interface Venta {
  idVenta: number
  serieFactura?: string | null
  numeroFactura?: string | null
  uuidDte?: string | null
  idCliente: number
  idSucursal: number
  idUsuario: number
  totalVenta: number | string
  fechaVenta: string
  fechaFacturacion?: string | null
  facturada: boolean
  ventaActiva: boolean
  fechaAnulacion?: string | null
  motivoAnulacion?: string | null
  idUsuarioAnulo?: number | null
  cliente?: VentaCliente
  sucursal?: VentaSucursal
  usuario?: VentaUsuario
  usuarioAnulo?: VentaUsuario | null
  detalles?: DetalleVenta[]
}

export interface VentasMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VentasResponse {
  data: Venta[]
  meta: VentasMeta
}

export type PeriodoEstadistica = 'dia' | 'semana' | 'mes' | 'trimestre' | 'anio'

export interface EstadisticasVenta {
  periodo: PeriodoEstadistica
  fechaDesde: string
  fechaHasta: string
  totalVentas: number
  montoTotal: number
  ticketPromedio: number
}

export interface EstadisticasParams {
  periodo?: PeriodoEstadistica
  idSucursal?: number
}

export interface VentasFilters {
  page?: number
  limit?: number
  search?: string
  idCliente?: number
  idSucursal?: number
  ventaActiva?: boolean
  facturada?: boolean
}

export interface DetalleVentaItemDto {
  idProducto: number
  idTipoPrecio: number
  cantidad: number
}

export interface CreateVentaDto {
  idCliente: number
  idSucursal: number
  serieFactura?: string
  numeroFactura?: string
  fechaVenta?: string
  detalles: DetalleVentaItemDto[]
}

export interface FacturarVentaDto {
  serieFactura: string
  numeroFactura: string
  uuidDte?: string
}

export interface AnularVentaDto {
  motivoAnulacion: string
}

export interface AgregarDetalleVentaDto {
  idProducto: number
  idTipoPrecio: number
  cantidad: number
}

export interface ActualizarDetalleVentaDto {
  idTipoPrecio?: number
  cantidad?: number
}
