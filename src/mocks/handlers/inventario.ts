import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toBoolean, toNumber } from '../utils'
import { getUsuarioSesion } from './shared'
import { ensureInventario } from '../stock'
import type {
  CreateProductoDto,
  InventarioProducto,
  Producto,
} from '../../modules/inventario/types/producto'
import type {
  CategoriaProducto,
  CreateCategoriaPayload,
  UpdateCategoriaPayload,
} from '../../modules/inventario/types/categoria'
import type {
  CreateInventarioSucursalDto,
  InventarioSucursal,
  UpdateInventarioSucursalDto,
} from '../../modules/inventario/types/inventarioSucursal'

function toInventarioProducto(inventario: InventarioSucursal): InventarioProducto {
  return {
    idInventario: inventario.idInventario,
    idProducto: inventario.idProducto,
    idSucursal: inventario.idSucursal,
    stockActual: inventario.stockActual,
    stockMinimo: inventario.stockMinimo,
    activo: inventario.activo,
    sucursal: inventario.sucursal
      ? {
          idSucursal: inventario.sucursal.idSucursal,
          codigoSucursal: inventario.sucursal.codigoSucursal,
          nombreSucursal: inventario.sucursal.nombreSucursal,
        }
      : null,
  }
}

function attachInventarios(db: MockDb, producto: Producto): Producto {
  return {
    ...producto,
    inventarios: db.inventarioSucursal
      .filter((item) => item.idProducto === producto.idProducto)
      .map(toInventarioProducto),
  }
}

function refreshInventario(db: MockDb, inventario: InventarioSucursal): InventarioSucursal {
  const producto = db.productos.find((item) => item.idProducto === inventario.idProducto)
  const sucursal = db.sucursales.find((item) => item.idSucursal === inventario.idSucursal)
  return {
    ...inventario,
    producto: producto ?? inventario.producto,
    sucursal: sucursal ?? inventario.sucursal,
  }
}

function sucursalesSesion(db: MockDb): Set<number> {
  const usuario = getUsuarioSesion(db)
  return new Set(usuario?.idSucursales ?? [])
}

function buildProductoCategorias(
  db: MockDb,
  idProducto: number,
  categorias: number[],
): Producto['productoCategoria'] {
  return categorias.map((idCategoria) => {
    const categoria = db.categoriasProducto.find(
      (item) => item.idCategoria === Number(idCategoria),
    )
    if (!categoria) throw httpError(409, 'Una de las categorías seleccionadas no existe')
    return {
      idProducto,
      idCategoria: categoria.idCategoria,
      categoriaProducto: {
        idCategoria: categoria.idCategoria,
        nombreCategoria: categoria.nombreCategoria,
      },
    }
  })
}

export function registerInventarioHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/productos$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const search = typeof params.search === 'string' ? params.search.trim() : ''
      const scopeSucursal = toBoolean(params.scopeSucursal) === true
      const sucursales = scopeSucursal ? sucursalesSesion(db) : null

      const filtrados: Producto[] = []
      for (const producto of db.productos) {
        if (search && !searchMatch([producto.codigoProducto, producto.nombreProducto], search)) {
          continue
        }
        if (sucursales && sucursales.size > 0) {
          const tieneInventario = db.inventarioSucursal.some(
            (item) =>
              item.idProducto === producto.idProducto &&
              item.activo &&
              sucursales.has(item.idSucursal),
          )
          if (!tieneInventario) continue
        }
        filtrados.push(producto)
      }

      const { data, meta } = paginate(filtrados, page, limit)
      return { data: data.map((producto) => attachInventarios(db, producto)), meta }
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/productos\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idProducto = Number(match[1])
      const producto = db.productos.find((item) => item.idProducto === idProducto)
      if (!producto) throw httpError(404, 'No se encontró el producto')
      return attachInventarios(db, producto)
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/productos$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateProductoDto>(body)
      if (!payload?.codigoProducto || !payload.nombreProducto) {
        throw httpError(400, 'Datos del producto incompletos')
      }

      const codigoProducto = payload.codigoProducto.trim().toUpperCase()
      if (db.productos.some((item) => item.codigoProducto.toUpperCase() === codigoProducto)) {
        throw httpError(409, 'Ya existe un producto con ese código')
      }

      const idProducto = nextId(db.productos, (item) => item.idProducto)
      const producto: Producto = {
        idProducto,
        codigoProducto,
        nombreProducto: payload.nombreProducto.trim(),
        descripcion: payload.descripcion?.trim() || null,
        ultimoCosto: payload.ultimoCosto ?? 0,
        activo: payload.activo ?? true,
        productoCategoria: buildProductoCategorias(db, idProducto, payload.categorias ?? []),
      }

      db.productos.push(producto)
      for (const idSucursal of sucursalesSesion(db)) {
        ensureInventario(db, idProducto, idSucursal)
      }
      saveDb()
      return attachInventarios(db, producto)
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/productos\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idProducto = Number(match[1])
      const existe = db.productos.some((item) => item.idProducto === idProducto)
      if (!existe) throw httpError(404, 'No se encontró el producto')

      db.productos = db.productos.filter((item) => item.idProducto !== idProducto)
      db.inventarioSucursal = db.inventarioSucursal.filter(
        (item) => item.idProducto !== idProducto,
      )
      db.productoPrecios = db.productoPrecios.filter(
        (item) => item.idProducto !== idProducto,
      )
      saveDb()
      return { success: true }
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/categorias-producto$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const search = typeof params.search === 'string' ? params.search.trim() : ''

      const filtradas: CategoriaProducto[] = []
      for (const categoria of db.categoriasProducto) {
        if (search && !searchMatch([categoria.nombreCategoria], search)) continue
        filtradas.push(categoria)
      }

      return paginate(filtradas, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/categorias-producto\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idCategoria = Number(match[1])
      const categoria = db.categoriasProducto.find((item) => item.idCategoria === idCategoria)
      if (!categoria) throw httpError(404, 'No se encontró la categoría')
      return categoria
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/categorias-producto$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateCategoriaPayload>(body)
      const nombreCategoria = payload?.nombreCategoria?.trim()
      if (!nombreCategoria) throw httpError(400, 'El nombre de la categoría es obligatorio')

      if (
        db.categoriasProducto.some(
          (item) => item.nombreCategoria.toLowerCase() === nombreCategoria.toLowerCase(),
        )
      ) {
        throw httpError(409, 'Ya existe una categoría de producto con ese nombre')
      }

      const categoria: CategoriaProducto = {
        idCategoria: nextId(db.categoriasProducto, (item) => item.idCategoria),
        nombreCategoria,
        activo: true,
      }
      db.categoriasProducto.push(categoria)
      saveDb()
      return categoria
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/categorias-producto\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idCategoria = Number(match[1])
      const categoria = db.categoriasProducto.find((item) => item.idCategoria === idCategoria)
      if (!categoria) throw httpError(404, 'No se encontró la categoría')

      const payload = parseBody<UpdateCategoriaPayload>(body)
      if (!payload) throw httpError(400, 'Datos de la categoría incompletos')

      if (payload.nombreCategoria !== undefined) {
        categoria.nombreCategoria = payload.nombreCategoria.trim()
      }
      if (payload.activo !== undefined) categoria.activo = payload.activo

      saveDb()
      return categoria
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/categorias-producto\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idCategoria = Number(match[1])
      const existe = db.categoriasProducto.some((item) => item.idCategoria === idCategoria)
      if (!existe) throw httpError(404, 'No se encontró la categoría')

      db.categoriasProducto = db.categoriasProducto.filter(
        (item) => item.idCategoria !== idCategoria,
      )
      db.productos = db.productos.map((producto) => ({
        ...producto,
        productoCategoria: producto.productoCategoria.filter(
          (item) => item.idCategoria !== idCategoria,
        ),
      }))
      saveDb()
      return { success: true }
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/inventario-sucursal$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const idProducto = toNumber(params.idProducto)
      const idSucursal = toNumber(params.idSucursal)
      const stockBajo = toBoolean(params.stockBajo) === true
      const search = typeof params.search === 'string' ? params.search.trim() : ''

      const filtrados: InventarioSucursal[] = []
      for (const inventario of db.inventarioSucursal) {
        if (idProducto && inventario.idProducto !== idProducto) continue
        if (idSucursal && inventario.idSucursal !== idSucursal) continue
        if (stockBajo && inventario.stockActual > inventario.stockMinimo) continue
        if (
          search &&
          !searchMatch(
            [
              inventario.producto?.nombreProducto,
              inventario.producto?.codigoProducto,
              inventario.sucursal?.nombreSucursal,
            ],
            search,
          )
        ) {
          continue
        }
        filtrados.push(refreshInventario(db, inventario))
      }

      return paginate(filtrados, page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/inventario-sucursal\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idInventario = Number(match[1])
      const inventario = db.inventarioSucursal.find((item) => item.idInventario === idInventario)
      if (!inventario) throw httpError(404, 'No se encontró el inventario')
      return refreshInventario(db, inventario)
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/inventario-sucursal$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateInventarioSucursalDto>(body)
      if (!payload) throw httpError(400, 'Datos de inventario incompletos')

      const producto = db.productos.find((item) => item.idProducto === Number(payload.idProducto))
      if (!producto) throw httpError(404, 'Producto no encontrado')
      const sucursal = db.sucursales.find((item) => item.idSucursal === Number(payload.idSucursal))
      if (!sucursal) throw httpError(404, 'Sucursal no encontrada')

      const inventario: InventarioSucursal = {
        idInventario: nextId(db.inventarioSucursal, (item) => item.idInventario),
        idProducto: producto.idProducto,
        idSucursal: sucursal.idSucursal,
        stockActual: payload.stockActual ?? 0,
        stockMinimo: payload.stockMinimo ?? 0,
        activo: true,
        producto,
        sucursal,
      }
      db.inventarioSucursal.push(inventario)
      saveDb()
      return inventario
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/inventario-sucursal\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idInventario = Number(match[1])
      const inventario = db.inventarioSucursal.find((item) => item.idInventario === idInventario)
      if (!inventario) throw httpError(404, 'No se encontró el inventario')

      const payload = parseBody<UpdateInventarioSucursalDto>(body)
      if (!payload) throw httpError(400, 'Datos de inventario incompletos')

      if (payload.idProducto !== undefined) inventario.idProducto = Number(payload.idProducto)
      if (payload.idSucursal !== undefined) inventario.idSucursal = Number(payload.idSucursal)
      if (payload.stockActual !== undefined) inventario.stockActual = payload.stockActual
      if (payload.stockMinimo !== undefined) inventario.stockMinimo = payload.stockMinimo
      if (payload.activo !== undefined) inventario.activo = payload.activo

      saveDb()
      return refreshInventario(db, inventario)
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/inventario-sucursal\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idInventario = Number(match[1])
      const existe = db.inventarioSucursal.some((item) => item.idInventario === idInventario)
      if (!existe) throw httpError(404, 'No se encontró el inventario')

      db.inventarioSucursal = db.inventarioSucursal.filter(
        (item) => item.idInventario !== idInventario,
      )
      saveDb()
      return { success: true }
    },
  })
}
