import type { Producto } from './producto'
import type { SucursalInventario } from './inventarioSucursal'

export type EstadoTraslado = 'PENDIENTE' | 'ENVIADO' | 'RECIBIDO' | 'ANULADO'

export interface TrasladoUsuario {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
}

export interface TrasladoDetalle {
  idDetalleTraslado: number
  idTraslado: number
  idProducto: number
  cantidad: number
  producto: Producto
}

export interface Traslado {
  idTraslado: number
  idSucursalOrigen: number
  idSucursalDestino: number
  estado: EstadoTraslado
  motivo: string | null
  fechaCreacion: string
  fechaEnvio: string | null
  fechaRecepcion: string | null
  idUsuarioSolicita: number
  idUsuarioEnvio: number | null
  idUsuarioRecibe: number | null
  idUsuarioAnulo: number | null
  sucursalOrigen: SucursalInventario
  sucursalDestino: SucursalInventario
  usuarioSolicita: TrasladoUsuario
  usuarioEnvio: TrasladoUsuario | null
  usuarioRecibe: TrasladoUsuario | null
  usuarioAnulo: TrasladoUsuario | null
  detalles: TrasladoDetalle[]
}

export interface TrasladosQuery {
  page?: number
  limit?: number
  estado?: EstadoTraslado
}

export interface TrasladosMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TrasladosResponse {
  data: Traslado[]
  meta: TrasladosMeta
}

export interface CreateTrasladoDetallePayload {
  idProducto: number
  cantidad: number
}

export interface CreateTrasladoPayload {
  idSucursalOrigen: number
  idSucursalDestino: number
  motivo?: string
  detalles: CreateTrasladoDetallePayload[]
}

export interface TrasladoDetalleFormData {
  idDetalleTemporal: number
  idProducto: string
  cantidad: string
  producto?: Producto
}

export interface TrasladoFormData {
  idSucursalOrigen: string
  idSucursalDestino: string
  motivo: string
  detalles: TrasladoDetalleFormData[]
}

export interface TrasladoFormErrors {
  idSucursalOrigen?: string
  idSucursalDestino?: string
  detalles?: string
}
