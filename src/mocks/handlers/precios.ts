import { loadDb, nextId, saveDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, parseBody, toNumber } from '../utils'
import { round2 } from '../seed'
import type { CreateProductoPrecioDto, ProductoPrecio } from '../../modules/precios/types/precio'

function calcularPrecioVenta(ultimoCosto: number, porcentajeMargen: number): number {
  return round2(ultimoCosto * (1 + porcentajeMargen / 100))
}

export function registerPreciosHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/producto-precios$/,
    handler: ({ params }) => {
      const db = loadDb()
      const idProducto = toNumber(params.idProducto)
      const idSucursal = toNumber(params.idSucursal)
      const limit = toNumber(params.limit) ?? 100

      const filtrados = db.productoPrecios.filter(
        (item) =>
          (!idProducto || item.idProducto === idProducto) &&
          (!idSucursal || item.idSucursal === idSucursal),
      )
      return filtrados.slice(0, limit)
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/producto-precios$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateProductoPrecioDto>(body)
      if (!payload) throw httpError(400, 'Datos del precio incompletos')

      const producto = db.productos.find(
        (item) => item.idProducto === Number(payload.idProducto),
      )
      if (!producto) throw httpError(404, 'Producto no encontrado')

      const tipoPrecio = db.tiposPrecio.find(
        (item) => item.idTipoPrecio === Number(payload.idTipoPrecio),
      )
      if (!tipoPrecio) throw httpError(404, 'Tipo de precio no encontrado')

      const porcentajeMargen = Number(payload.porcentajeMargen)
      const precio: ProductoPrecio = {
        idProductoPrecio: nextId(db.productoPrecios, (item) => item.idProductoPrecio),
        idProducto: producto.idProducto,
        idTipoPrecio: tipoPrecio.idTipoPrecio,
        idSucursal: Number(payload.idSucursal),
        porcentajeMargen,
        precioVenta: calcularPrecioVenta(producto.ultimoCosto, porcentajeMargen),
        activo: true,
        tipoPrecio,
      }

      db.productoPrecios.push(precio)
      saveDb()
      return precio
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/producto-precios\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idProductoPrecio = Number(match[1])
      const precio = db.productoPrecios.find(
        (item) => item.idProductoPrecio === idProductoPrecio,
      )
      if (!precio) throw httpError(404, 'No se encontró el precio')

      const payload = parseBody<{ porcentajeMargen?: number }>(body)
      if (!payload || payload.porcentajeMargen === undefined) {
        throw httpError(400, 'Datos del precio incompletos')
      }

      const producto = db.productos.find((item) => item.idProducto === precio.idProducto)
      const ultimoCosto = producto?.ultimoCosto ?? 0

      precio.porcentajeMargen = Number(payload.porcentajeMargen)
      precio.precioVenta = calcularPrecioVenta(ultimoCosto, precio.porcentajeMargen)

      saveDb()
      return precio
    },
  })
}
