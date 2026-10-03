import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toBoolean, toNumber } from '../utils'
import { round2 } from '../seed'
import { getUsuarioSesion, toUsuarioRef } from './shared'
import { ajustarStock, findInventario, registrarMovimiento } from '../stock'
import type { Client } from '../../modules/crm/types/client'
import type { SucursalInventario } from '../../modules/inventario/types/inventarioSucursal'
import type {
  AgregarDetalleVentaDto,
  ActualizarDetalleVentaDto,
  AnularVentaDto,
  CreateVentaDto,
  DetalleVenta,
  EstadisticasVenta,
  FacturarVentaDto,
  PeriodoEstadistica,
  Venta,
  VentaCliente,
  VentaSucursal,
} from '../../modules/ventas/types/venta'

const PERIODOS: PeriodoEstadistica[] = ['dia', 'semana', 'mes', 'trimestre', 'anio']

function buildVentaCliente(cliente: Client): VentaCliente {
  return {
    idCliente: cliente.idCliente,
    dpiCliente: cliente.dpiCliente,
    nit: cliente.nit ?? null,
    primerNombre: cliente.primerNombre,
    segundoNombre: cliente.segundoNombre ?? null,
    primerApellido: cliente.primerApellido,
    segundoApellido: cliente.segundoApellido ?? null,
    telefono: cliente.telefono ?? '',
  }
}

function buildVentaSucursal(sucursal: SucursalInventario): VentaSucursal {
  return {
    idSucursal: sucursal.idSucursal,
    codigoSucursal: sucursal.codigoSucursal,
    nitSucursal: sucursal.nitSucursal,
    nombreSucursal: sucursal.nombreSucursal,
  }
}

function nextDetalleVentaId(db: MockDb): number {
  let max = 0
  for (const venta of db.ventas) {
    for (const detalle of venta.detalles ?? []) {
      if (detalle.idDetalleVenta > max) max = detalle.idDetalleVenta
    }
  }
  return max + 1
}

function buildDetalleVenta(
  db: MockDb,
  idVenta: number,
  idDetalleVenta: number,
  idSucursal: number,
  item: { idProducto: number; idTipoPrecio: number; cantidad: number },
): DetalleVenta {
  const producto = db.productos.find((p) => p.idProducto === Number(item.idProducto))
  if (!producto) throw httpError(400, 'El producto no existe')

  const tipoPrecio = db.tiposPrecio.find((t) => t.idTipoPrecio === Number(item.idTipoPrecio))
  if (!tipoPrecio) throw httpError(400, 'El tipo de precio no existe')

  const precioObj = db.productoPrecios.find(
    (p) =>
      p.idProducto === producto.idProducto &&
      p.idTipoPrecio === tipoPrecio.idTipoPrecio &&
      p.idSucursal === idSucursal &&
      p.activo,
  )
  if (!precioObj) {
    throw httpError(
      400,
      `El producto ${producto.nombreProducto} no tiene precio configurado para esta sucursal y tipo de precio`,
    )
  }

  const cantidad = Number(item.cantidad)
  const precioVenta = Number(precioObj.precioVenta) || 0

  return {
    idDetalleVenta,
    idVenta,
    idProducto: producto.idProducto,
    idTipoPrecio: tipoPrecio.idTipoPrecio,
    cantidad,
    precioVenta,
    subtotal: round2(cantidad * precioVenta),
    producto,
    tipoPrecio,
  }
}

function recalcularTotal(venta: Venta): void {
  const detalles = venta.detalles ?? []
  venta.totalVenta = round2(detalles.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0))
}

function periodoDesde(periodo: PeriodoEstadistica, now: Date): Date {
  const desde = new Date(now)
  switch (periodo) {
    case 'dia':
      desde.setHours(0, 0, 0, 0)
      break
    case 'semana':
      desde.setDate(desde.getDate() - 6)
      desde.setHours(0, 0, 0, 0)
      break
    case 'mes':
      desde.setDate(1)
      desde.setHours(0, 0, 0, 0)
      break
    case 'trimestre':
      desde.setMonth(Math.floor(desde.getMonth() / 3) * 3, 1)
      desde.setHours(0, 0, 0, 0)
      break
    case 'anio':
      desde.setMonth(0, 1)
      desde.setHours(0, 0, 0, 0)
      break
  }
  return desde
}

function buscarVentas(db: MockDb, params: Record<string, unknown>): Venta[] {
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const idCliente = toNumber(params.idCliente)
  const idSucursal = toNumber(params.idSucursal)
  const ventaActiva = toBoolean(params.ventaActiva)
  const facturada = toBoolean(params.facturada)

  const filtradas: Venta[] = []
  for (const venta of db.ventas) {
    if (idCliente && venta.idCliente !== idCliente) continue
    if (idSucursal && venta.idSucursal !== idSucursal) continue
    if (ventaActiva !== undefined && venta.ventaActiva !== ventaActiva) continue
    if (facturada !== undefined && venta.facturada !== facturada) continue

    if (
      search &&
      !searchMatch(
        [
          String(venta.idVenta),
          venta.serieFactura,
          venta.numeroFactura,
          venta.cliente?.primerNombre,
          venta.cliente?.primerApellido,
        ],
        search,
      )
    ) {
      continue
    }
    filtradas.push(venta)
  }

  return filtradas
}

export function registerVentasHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/ventas$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const filtradas = buscarVentas(db, params).sort(
        (a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime(),
      )
      return paginate(filtradas, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/ventas\/estadisticas$/,
    handler: ({ params }) => {
      const db = loadDb()
      const periodo = (
        PERIODOS.includes(params.periodo as PeriodoEstadistica)
          ? params.periodo
          : 'mes'
      ) as PeriodoEstadistica
      const idSucursal = toNumber(params.idSucursal)

      const now = new Date()
      const desde = periodoDesde(periodo, now).getTime()

      let montoTotal = 0
      let totalVentas = 0
      for (const venta of db.ventas) {
        if (!venta.ventaActiva) continue
        if (idSucursal && venta.idSucursal !== idSucursal) continue
        const fecha = new Date(venta.fechaVenta).getTime()
        if (fecha < desde) continue
        totalVentas += 1
        montoTotal += Number(venta.totalVenta) || 0
      }

      const estadistica: EstadisticasVenta = {
        periodo,
        fechaDesde: new Date(desde).toISOString(),
        fechaHasta: now.toISOString(),
        totalVentas,
        montoTotal: round2(montoTotal),
        ticketPromedio: totalVentas > 0 ? round2(montoTotal / totalVentas) : 0,
      }
      return estadistica
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/ventas\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')
      return venta
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/ventas$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateVentaDto>(body)
      if (!payload) throw httpError(400, 'Datos de la venta incompletos')

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const cliente = db.clientes.find((item) => item.idCliente === Number(payload.idCliente))
      if (!cliente) throw httpError(404, 'El cliente no existe')

      const idSucursal = Number(payload.idSucursal)
      const sucursal = db.sucursales.find((item) => item.idSucursal === idSucursal)
      if (!sucursal) throw httpError(404, 'La sucursal no existe')

      if (!payload.detalles || payload.detalles.length === 0) {
        throw httpError(400, 'La venta debe incluir al menos un producto')
      }

      const idVenta = nextId(db.ventas, (item) => item.idVenta)
      let detalleId = nextDetalleVentaId(db)

      const detalles = payload.detalles.map((item) =>
        buildDetalleVenta(db, idVenta, detalleId++, idSucursal, item),
      )

      for (const detalle of detalles) {
        const inventario = findInventario(db, detalle.idProducto, idSucursal)
        const stock = inventario?.stockActual ?? 0
        if (stock < detalle.cantidad) {
          throw httpError(
            409,
            `Stock insuficiente para ${detalle.producto?.nombreProducto ?? 'el producto'}`,
          )
        }
      }

      const fechaVenta = payload.fechaVenta
        ? new Date(payload.fechaVenta).toISOString()
        : new Date().toISOString()
      const facturada = Boolean(payload.serieFactura && payload.numeroFactura)

      const venta: Venta = {
        idVenta,
        serieFactura: payload.serieFactura ?? null,
        numeroFactura: payload.numeroFactura ?? null,
        uuidDte: null,
        idCliente: cliente.idCliente,
        idSucursal: sucursal.idSucursal,
        idUsuario: usuario.idUsuario,
        totalVenta: round2(detalles.reduce((sum, detalle) => sum + Number(detalle.subtotal), 0)),
        fechaVenta,
        fechaFacturacion: facturada ? fechaVenta : null,
        facturada,
        ventaActiva: true,
        fechaAnulacion: null,
        motivoAnulacion: null,
        idUsuarioAnulo: null,
        cliente: buildVentaCliente(cliente),
        sucursal: buildVentaSucursal(sucursal),
        usuario: toUsuarioRef(usuario),
        usuarioAnulo: null,
        detalles,
      }

      for (const detalle of detalles) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          idSucursal,
          -detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal,
          tipo: 'SALIDA',
          origen: 'VENTA',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: idVenta,
          usuario: toUsuarioRef(usuario),
          observacion: `Venta #${idVenta}`,
          fecha: fechaVenta,
        })
      }

      db.ventas.push(venta)
      saveDb()
      return venta
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/ventas\/(\d+)\/facturar$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')
      if (!venta.ventaActiva) throw httpError(409, 'La venta está anulada')
      if (venta.facturada) throw httpError(409, 'La venta ya está facturada')

      const payload = parseBody<FacturarVentaDto>(body)
      if (!payload?.serieFactura || !payload.numeroFactura) {
        throw httpError(400, 'Serie y número de factura son obligatorios')
      }

      venta.serieFactura = payload.serieFactura.trim()
      venta.numeroFactura = payload.numeroFactura.trim()
      venta.uuidDte = payload.uuidDte ?? null
      venta.facturada = true
      venta.fechaFacturacion = new Date().toISOString()

      saveDb()
      return venta
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/ventas\/(\d+)\/anular$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')
      if (!venta.ventaActiva) throw httpError(409, 'La venta ya está anulada')

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const payload = parseBody<AnularVentaDto>(body)
      const fecha = new Date().toISOString()

      venta.ventaActiva = false
      venta.fechaAnulacion = fecha
      venta.motivoAnulacion = payload?.motivoAnulacion?.trim() || null
      venta.idUsuarioAnulo = usuario.idUsuario
      venta.usuarioAnulo = toUsuarioRef(usuario)

      for (const detalle of venta.detalles ?? []) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          venta.idSucursal,
          detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal: venta.idSucursal,
          tipo: 'ENTRADA',
          origen: 'ANULACION_VENTA',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: venta.idVenta,
          usuario: toUsuarioRef(usuario),
          observacion: 'Anulación de venta',
          fecha,
        })
      }

      saveDb()
      return venta
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/ventas\/(\d+)\/detalles$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')
      if (!venta.ventaActiva) throw httpError(409, 'La venta está anulada')

      const payload = parseBody<AgregarDetalleVentaDto>(body)
      if (!payload) throw httpError(400, 'Datos del detalle incompletos')

      const detalle = buildDetalleVenta(
        db,
        idVenta,
        nextDetalleVentaId(db),
        venta.idSucursal,
        payload,
      )

      const inventario = findInventario(db, detalle.idProducto, venta.idSucursal)
      if ((inventario?.stockActual ?? 0) < detalle.cantidad) {
        throw httpError(409, 'Stock insuficiente para el producto')
      }

      const usuarioSesion = getUsuarioSesion(db)
      const usuarioMovimiento = usuarioSesion ? toUsuarioRef(usuarioSesion) : venta.usuario
      if (!usuarioMovimiento) throw httpError(401, 'No autorizado')

      const { saldoAnterior, saldoNuevo } = ajustarStock(
        db,
        detalle.idProducto,
        venta.idSucursal,
        -detalle.cantidad,
      )
      registrarMovimiento(db, {
        idProducto: detalle.idProducto,
        idSucursal: venta.idSucursal,
        tipo: 'SALIDA',
        origen: 'VENTA',
        cantidad: detalle.cantidad,
        saldoAnterior,
        saldoNuevo,
        idReferencia: venta.idVenta,
        usuario: usuarioMovimiento,
        observacion: `Venta #${venta.idVenta}`,
      })

      venta.detalles = [...(venta.detalles ?? []), detalle]
      recalcularTotal(venta)
      saveDb()
      return venta
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/ventas\/(\d+)\/detalles\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const idDetalle = Number(match[2])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')
      if (!venta.ventaActiva) throw httpError(409, 'La venta está anulada')

      const detalle = (venta.detalles ?? []).find((item) => item.idDetalleVenta === idDetalle)
      if (!detalle) throw httpError(404, 'No se encontró el detalle')

      const payload = parseBody<ActualizarDetalleVentaDto>(body)
      if (!payload) throw httpError(400, 'Datos del detalle incompletos')

      const cantidadAnterior = detalle.cantidad
      const nuevaCantidad = payload.cantidad ?? cantidadAnterior
      const idTipoPrecio = payload.idTipoPrecio ?? detalle.idTipoPrecio

      const actualizado = buildDetalleVenta(db, idVenta, detalle.idDetalleVenta, venta.idSucursal, {
        idProducto: detalle.idProducto,
        idTipoPrecio,
        cantidad: nuevaCantidad,
      })
      Object.assign(detalle, actualizado)

      const delta = cantidadAnterior - nuevaCantidad
      if (delta !== 0) {
        if (delta < 0) {
          const inventario = findInventario(db, detalle.idProducto, venta.idSucursal)
          if ((inventario?.stockActual ?? 0) < Math.abs(delta)) {
            throw httpError(409, 'Stock insuficiente para el producto')
          }
        }
        ajustarStock(db, detalle.idProducto, venta.idSucursal, delta)
      }

      recalcularTotal(venta)
      saveDb()
      return venta
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/ventas\/(\d+)\/detalles\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idVenta = Number(match[1])
      const idDetalle = Number(match[2])
      const venta = db.ventas.find((item) => item.idVenta === idVenta)
      if (!venta) throw httpError(404, 'No se encontró la venta')

      const detalle = (venta.detalles ?? []).find((item) => item.idDetalleVenta === idDetalle)
      if (!detalle) throw httpError(404, 'No se encontró el detalle')

      ajustarStock(db, detalle.idProducto, venta.idSucursal, detalle.cantidad)
      venta.detalles = (venta.detalles ?? []).filter(
        (item) => item.idDetalleVenta !== idDetalle,
      )
      recalcularTotal(venta)
      saveDb()
      return venta
    },
  })
}
