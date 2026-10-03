import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toBoolean, toNumber } from '../utils'
import { round2 } from '../seed'
import { getUsuarioSesion, toUsuarioRef } from './shared'
import { ajustarStock, registrarMovimiento } from '../stock'
import type { Compra, CompraDetalle, CreateCompraPayload } from '../../modules/compras/types/compra'

function nextDetalleCompraId(db: MockDb): number {
  let max = 0
  for (const compra of db.compras) {
    for (const detalle of compra.detalles) {
      if (detalle.idDetalleCompra > max) max = detalle.idDetalleCompra
    }
  }
  return max + 1
}

function buscarCompras(db: MockDb, params: Record<string, unknown>): Compra[] {
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const fechaInicio = typeof params.fechaInicio === 'string' ? params.fechaInicio : ''
  const fechaFinal = typeof params.fechaFinal === 'string' ? params.fechaFinal : ''
  const idProveedor = toNumber(params.idProveedor)
  const idSucursal = toNumber(params.idSucursal)
  const compraActiva = toBoolean(params.compraActiva)

  const filtradas: Compra[] = []
  for (const compra of db.compras) {
    if (idProveedor && compra.proveedor.idProveedor !== idProveedor) continue
    if (idSucursal && compra.sucursal.idSucursal !== idSucursal) continue
    if (compraActiva !== undefined && compra.compraActiva !== compraActiva) continue

    const fecha = compra.fechaCompra.slice(0, 10)
    if (fechaInicio && fecha < fechaInicio) continue
    if (fechaFinal && fecha > fechaFinal) continue

    if (
      search &&
      !searchMatch(
        [compra.serieFactura, compra.numeroFactura, compra.proveedor.nombreProveedor],
        search,
      )
    ) {
      continue
    }
    filtradas.push(compra)
  }

  return filtradas
}

export function registerComprasHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/compras$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const filtradas = buscarCompras(db, params).sort(
        (a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime(),
      )
      return paginate(filtradas, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/compras\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idCompra = Number(match[1])
      const compra = db.compras.find((item) => item.idCompra === idCompra)
      if (!compra) throw httpError(404, 'No se encontró la compra')
      return compra
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/compras$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateCompraPayload>(body)
      if (!payload) throw httpError(400, 'Datos de la compra incompletos')

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const serieFactura = payload.serieFactura.trim()
      const numeroFactura = payload.numeroFactura.trim()
      const idProveedor = Number(payload.idProveedor)

      if (
        db.compras.some(
          (item) =>
            item.serieFactura === serieFactura &&
            item.numeroFactura === numeroFactura &&
            item.proveedor.idProveedor === idProveedor,
        )
      ) {
        throw httpError(409, 'Ya existe una compra registrada con esa serie y número para este proveedor')
      }

      const proveedor = db.proveedores.find((item) => item.idProveedor === idProveedor)
      if (!proveedor) throw httpError(404, 'El proveedor no existe')

      const idSucursal = Number(payload.idSucursal)
      const sucursal = db.sucursales.find((item) => item.idSucursal === idSucursal)
      if (!sucursal) throw httpError(404, 'La sucursal no existe')

      if (!payload.detalles || payload.detalles.length === 0) {
        throw httpError(400, 'La compra debe incluir al menos un producto')
      }

      const idCompra = nextId(db.compras, (item) => item.idCompra)
      let detalleId = nextDetalleCompraId(db)

      const detalles: CompraDetalle[] = payload.detalles.map((detalle) => {
        const producto = db.productos.find(
          (item) => item.idProducto === Number(detalle.idProducto),
        )
        if (!producto) throw httpError(404, 'El producto no existe')

        const cantidad = Number(detalle.cantidad)
        const precioCostoUnitario = Number(detalle.precioCostoUnitario)
        producto.ultimoCosto = precioCostoUnitario

        return {
          idDetalleCompra: detalleId++,
          idProducto: producto.idProducto,
          cantidad,
          precioCostoUnitario,
          subtotal: round2(cantidad * precioCostoUnitario),
          producto: {
            idProducto: producto.idProducto,
            codigoProducto: producto.codigoProducto,
            nombreProducto: producto.nombreProducto,
            ultimoCosto: producto.ultimoCosto,
          },
        }
      })

      const fechaCompra = payload.fechaCompra ?? new Date().toISOString()
      const compra: Compra = {
        idCompra,
        serieFactura,
        numeroFactura,
        fechaCompra,
        totalCompra: round2(detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)),
        compraActiva: true,
        motivoAnulacion: null,
        proveedor: { idProveedor: proveedor.idProveedor, nombreProveedor: proveedor.nombreProveedor },
        sucursal: { idSucursal: sucursal.idSucursal, nombreSucursal: sucursal.nombreSucursal },
        detalles,
      }

      for (const detalle of detalles) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          idSucursal,
          detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal,
          tipo: 'ENTRADA',
          origen: 'COMPRA',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: idCompra,
          usuario: toUsuarioRef(usuario),
          observacion: `Compra ${serieFactura}-${numeroFactura}`,
          fecha: fechaCompra,
        })
      }

      db.compras.push(compra)
      saveDb()
      return compra
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/compras\/(\d+)\/anular$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idCompra = Number(match[1])
      const compra = db.compras.find((item) => item.idCompra === idCompra)
      if (!compra) throw httpError(404, 'No se encontró la compra')
      if (!compra.compraActiva) throw httpError(409, 'La compra ya está anulada')

      const usuario = getUsuarioSesion(db)
      if (!usuario) throw httpError(401, 'No autorizado')

      const payload = parseBody<{ motivoAnulacion?: string }>(body)
      const fecha = new Date().toISOString()

      compra.compraActiva = false
      compra.motivoAnulacion = payload?.motivoAnulacion?.trim() || null

      for (const detalle of compra.detalles) {
        const { saldoAnterior, saldoNuevo } = ajustarStock(
          db,
          detalle.idProducto,
          compra.sucursal.idSucursal,
          -detalle.cantidad,
        )
        registrarMovimiento(db, {
          idProducto: detalle.idProducto,
          idSucursal: compra.sucursal.idSucursal,
          tipo: 'SALIDA',
          origen: 'ANULACION_COMPRA',
          cantidad: detalle.cantidad,
          saldoAnterior,
          saldoNuevo,
          idReferencia: compra.idCompra,
          usuario: toUsuarioRef(usuario),
          observacion: 'Anulación de compra',
          fecha,
        })
      }

      saveDb()
      return compra
    },
  })
}
