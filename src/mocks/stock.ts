import { nextId, type MockDb } from './db'
import { httpError } from './utils'
import type { UsuarioRef } from './handlers/shared'
import type { InventarioSucursal } from '../modules/inventario/types/inventarioSucursal'
import type {
  MovimientoInventario,
  OrigenMovimiento,
  TipoMovimiento,
} from '../modules/inventario/types/movimiento'

export function findInventario(
  db: MockDb,
  idProducto: number,
  idSucursal: number,
): InventarioSucursal | undefined {
  return db.inventarioSucursal.find(
    (item) => item.idProducto === idProducto && item.idSucursal === idSucursal,
  )
}

export function ensureInventario(
  db: MockDb,
  idProducto: number,
  idSucursal: number,
): InventarioSucursal {
  const existente = findInventario(db, idProducto, idSucursal)
  if (existente) return existente

  const producto = db.productos.find((item) => item.idProducto === idProducto)
  if (!producto) throw httpError(404, 'Producto no encontrado')

  const sucursal = db.sucursales.find((item) => item.idSucursal === idSucursal)
  if (!sucursal) throw httpError(404, 'Sucursal no encontrada')

  const inventario: InventarioSucursal = {
    idInventario: nextId(db.inventarioSucursal, (item) => item.idInventario),
    idProducto,
    idSucursal,
    stockActual: 0,
    stockMinimo: 0,
    activo: true,
    producto,
    sucursal,
  }
  db.inventarioSucursal.push(inventario)
  return inventario
}

export function ajustarStock(
  db: MockDb,
  idProducto: number,
  idSucursal: number,
  delta: number,
): { saldoAnterior: number; saldoNuevo: number } {
  const inventario = ensureInventario(db, idProducto, idSucursal)
  const saldoAnterior = inventario.stockActual
  const saldoNuevo = saldoAnterior + delta
  inventario.stockActual = saldoNuevo
  return { saldoAnterior, saldoNuevo }
}

export interface RegistrarMovimientoParams {
  idProducto: number
  idSucursal: number
  tipo: TipoMovimiento
  origen: OrigenMovimiento
  cantidad: number
  saldoAnterior: number
  saldoNuevo: number
  idReferencia: number | null
  idTraslado?: number | null
  usuario: UsuarioRef
  observacion?: string | null
  fecha?: string
}

export function registrarMovimiento(
  db: MockDb,
  params: RegistrarMovimientoParams,
): MovimientoInventario {
  const producto = db.productos.find((item) => item.idProducto === params.idProducto)
  if (!producto) throw httpError(404, 'Producto no encontrado')

  const sucursal = db.sucursales.find((item) => item.idSucursal === params.idSucursal)
  if (!sucursal) throw httpError(404, 'Sucursal no encontrada')

  const movimiento: MovimientoInventario = {
    idMovimiento: nextId(db.movimientos, (item) => item.idMovimiento),
    idProducto: params.idProducto,
    idSucursal: params.idSucursal,
    tipo: params.tipo,
    origen: params.origen,
    cantidad: params.cantidad,
    saldoAnterior: params.saldoAnterior,
    saldoNuevo: params.saldoNuevo,
    idReferencia: params.idReferencia,
    idTraslado: params.idTraslado ?? null,
    idUsuario: params.usuario.idUsuario,
    fecha: params.fecha ?? new Date().toISOString(),
    observacion: params.observacion ?? null,
    producto,
    sucursal,
    usuario: params.usuario,
  }

  db.movimientos.push(movimiento)
  return movimiento
}
