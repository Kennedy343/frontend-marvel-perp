import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, toNumber } from '../utils'
import { getUsuarioSesion, toUsuarioRef } from './shared'
import { ajustarStock, registrarMovimiento } from '../stock'
import type {
  MovimientoInventario,
  OrigenMovimiento,
  TipoMovimiento,
} from '../../modules/inventario/types/movimiento'
import type {
  CreateTrasladoPayload,
  Traslado,
  TrasladoDetalle,
} from '../../modules/inventario/types/traslado'

function buscarMovimientos(db: MockDb, params: Record<string, unknown>): MovimientoInventario[] {
  const idProducto = toNumber(params.idProducto)
  const idSucursal = toNumber(params.idSucursal)
  const tipo = typeof params.tipo === 'string' ? (params.tipo as TipoMovimiento) : undefined
  const origen =
    typeof params.origen === 'string' ? (params.origen as OrigenMovimiento) : undefined
  const desde = typeof params.desde === 'string' ? new Date(params.desde).getTime() : undefined
  const hasta = typeof params.hasta === 'string' ? new Date(params.hasta).getTime() : undefined

  const filtrados: MovimientoInventario[] = []
  for (const movimiento of db.movimientos) {
    if (idProducto && movimiento.idProducto !== idProducto) continue
    if (idSucursal && movimiento.idSucursal !== idSucursal) continue
    if (tipo && movimiento.tipo !== tipo) continue
    if (origen && movimiento.origen !== origen) continue

    const fecha = new Date(movimiento.fecha).getTime()
    if (desde !== undefined && !Number.isNaN(desde) && fecha < desde) continue
    if (hasta !== undefined && !Number.isNaN(hasta) && fecha > hasta) continue

    filtrados.push(movimiento)
  }

  return filtrados
}

function nextDetalleTrasladoId(db: MockDb): number {
  let max = 0
  for (const traslado of db.traslados) {
    for (const detalle of traslado.detalles) {
      if (detalle.idDetalleTraslado > max) max = detalle.idDetalleTraslado
    }
  }
  return max + 1
}

export function registerMovimientosHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/inventario\/movimientos$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const filtrados = buscarMovimientos(db, params).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      )
      return paginate(filtrados, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/inventario\/movimientos\/kardex\/(\d+)$/,
    handler: ({ match, params }) => {
      const db = loadDb()
      const idProducto = Number(match[1])
      const idSucursal = toNumber(params.idSucursal)
      const filtrados = db.movimientos.filter(
        (item) =>
          item.idProducto === idProducto && (!idSucursal || item.idSucursal === idSucursal),
      )
      return filtrados.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/traslados$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const estado = typeof params.estado === 'string' ? params.estado : undefined

      const filtrados = db.traslados
        .filter((item) => !estado || item.estado === estado)
        .sort(
          (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
        )
      return paginate(filtrados, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/traslados\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idTraslado = Number(match[1])
      const traslado = db.traslados.find((item) => item.idTraslado === idTraslado)
      if (!traslado) throw httpError(404, 'No se encontró el traslado')
      return traslado
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/traslados$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateTrasladoPayload>(body)
      if (!payload) throw httpError(400, 'Datos del traslado incompletos')

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const sucursalOrigen = db.sucursales.find(
        (item) => item.idSucursal === Number(payload.idSucursalOrigen),
      )
      if (!sucursalOrigen) throw httpError(404, 'La sucursal de origen no existe')

      const sucursalDestino = db.sucursales.find(
        (item) => item.idSucursal === Number(payload.idSucursalDestino),
      )
      if (!sucursalDestino) throw httpError(404, 'La sucursal de destino no existe')

      if (sucursalOrigen.idSucursal === sucursalDestino.idSucursal) {
        throw httpError(400, 'La sucursal de destino debe ser diferente a la de origen')
      }

      if (!payload.detalles || payload.detalles.length === 0) {
        throw httpError(400, 'El traslado debe incluir al menos un producto')
      }

      const idTraslado = nextId(db.traslados, (item) => item.idTraslado)
      let detalleId = nextDetalleTrasladoId(db)

      const detalles: TrasladoDetalle[] = payload.detalles.map((detalle) => {
        const producto = db.productos.find(
          (item) => item.idProducto === Number(detalle.idProducto),
        )
        if (!producto) throw httpError(404, 'La sucursal o el producto seleccionado no existe')
        return {
          idDetalleTraslado: detalleId++,
          idTraslado,
          idProducto: producto.idProducto,
          cantidad: Number(detalle.cantidad),
          producto,
        }
      })

      const traslado: Traslado = {
        idTraslado,
        idSucursalOrigen: sucursalOrigen.idSucursal,
        idSucursalDestino: sucursalDestino.idSucursal,
        estado: 'PENDIENTE',
        motivo: payload.motivo?.trim() || null,
        fechaCreacion: new Date().toISOString(),
        fechaEnvio: null,
        fechaRecepcion: null,
        idUsuarioSolicita: usuario.idUsuario,
        idUsuarioEnvio: null,
        idUsuarioRecibe: null,
        idUsuarioAnulo: null,
        sucursalOrigen,
        sucursalDestino,
        usuarioSolicita: toUsuarioRef(usuario),
        usuarioEnvio: null,
        usuarioRecibe: null,
        usuarioAnulo: null,
        detalles,
      }

      db.traslados.push(traslado)
      saveDb()
      return traslado
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/traslados\/(\d+)\/enviar$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idTraslado = Number(match[1])
      const traslado = db.traslados.find((item) => item.idTraslado === idTraslado)
      if (!traslado) throw httpError(404, 'No se encontró el traslado')
      if (traslado.estado !== 'PENDIENTE') {
        throw httpError(409, 'Solo se pueden enviar traslados pendientes')
      }

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const fecha = new Date().toISOString()
      traslado.estado = 'ENVIADO'
      traslado.fechaEnvio = fecha
      traslado.idUsuarioEnvio = usuario.idUsuario
      traslado.usuarioEnvio = toUsuarioRef(usuario)

      for (const detalle of traslado.detalles) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          traslado.idSucursalOrigen,
          -detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal: traslado.idSucursalOrigen,
          tipo: 'SALIDA',
          origen: 'TRASLADO',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: traslado.idTraslado,
          idTraslado: traslado.idTraslado,
          usuario: toUsuarioRef(usuario),
          observacion: 'Envío de traslado',
          fecha,
        })
      }

      saveDb()
      return traslado
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/traslados\/(\d+)\/recibir$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idTraslado = Number(match[1])
      const traslado = db.traslados.find((item) => item.idTraslado === idTraslado)
      if (!traslado) throw httpError(404, 'No se encontró el traslado')
      if (traslado.estado !== 'ENVIADO') {
        throw httpError(409, 'Solo se pueden recibir traslados enviados')
      }

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const fecha = new Date().toISOString()
      traslado.estado = 'RECIBIDO'
      traslado.fechaRecepcion = fecha
      traslado.idUsuarioRecibe = usuario.idUsuario
      traslado.usuarioRecibe = toUsuarioRef(usuario)

      for (const detalle of traslado.detalles) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          traslado.idSucursalDestino,
          detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal: traslado.idSucursalDestino,
          tipo: 'ENTRADA',
          origen: 'TRASLADO',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: traslado.idTraslado,
          idTraslado: traslado.idTraslado,
          usuario: toUsuarioRef(usuario),
          observacion: 'Recepción de traslado',
          fecha,
        })
      }

      saveDb()
      return traslado
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/traslados\/(\d+)\/anular$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idTraslado = Number(match[1])
      const traslado = db.traslados.find((item) => item.idTraslado === idTraslado)
      if (!traslado) throw httpError(404, 'No se encontró el traslado')
      if (traslado.estado === 'RECIBIDO' || traslado.estado === 'ANULADO') {
        throw httpError(409, 'El traslado ya no se puede anular')
      }

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const fecha = new Date().toISOString()
      if (traslado.estado === 'ENVIADO') {
        for (const detalle of traslado.detalles) {
          const { saldoAnterior, saldoNuevo } = ajustarStock(
            db,
            detalle.idProducto,
            traslado.idSucursalOrigen,
            detalle.cantidad,
          )
          registrarMovimiento(db, {
            idProducto: detalle.idProducto,
            idSucursal: traslado.idSucursalOrigen,
            tipo: 'ENTRADA',
            origen: 'TRASLADO',
            cantidad: detalle.cantidad,
            saldoAnterior,
            saldoNuevo,
            idReferencia: traslado.idTraslado,
            idTraslado: traslado.idTraslado,
            usuario: toUsuarioRef(usuario),
            observacion: 'Anulación de traslado',
            fecha,
          })
        }
      }

      traslado.estado = 'ANULADO'
      traslado.idUsuarioAnulo = usuario.idUsuario
      traslado.usuarioAnulo = toUsuarioRef(usuario)

      saveDb()
      return traslado
    },
  })
}
