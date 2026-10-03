import type { Producto } from './producto'
import type { SucursalInventario } from './inventarioSucursal'

export type TipoMovimiento = 'ENTRADA' | 'SALIDA'

export type OrigenMovimiento =
  | 'COMPRA'
  | 'VENTA'
  | 'TRASLADO'
  | 'AJUSTE'
  | 'INICIAL'
  | 'ANULACION_COMPRA'
  | 'ANULACION_VENTA'

export interface MovimientoUsuario {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
}

export interface MovimientoInventario {
  idMovimiento: number
  idProducto: number
  idSucursal: number
  tipo: TipoMovimiento
  origen: OrigenMovimiento
  cantidad: number
  saldoAnterior: number
  saldoNuevo: number
  idReferencia: number | null
  idTraslado: number | null
  idUsuario: number
  fecha: string
  observacion: string | null
  producto: Producto
  sucursal: SucursalInventario
  usuario: MovimientoUsuario
}

export interface MovimientosQuery {
  page?: number
  limit?: number
  idProducto?: number
  idSucursal?: number
  tipo?: TipoMovimiento
  origen?: OrigenMovimiento
  desde?: string
  hasta?: string
}

export interface MovimientosMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface MovimientosResponse {
  data: MovimientoInventario[]
  meta: MovimientosMeta
}
