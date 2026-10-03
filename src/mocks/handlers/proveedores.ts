import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toNumber } from '../utils'
import type {
  CreateProveedorPayload,
  Proveedor,
  UpdateProveedorPayload,
} from '../../modules/proveedores/types/proveedor'

function findDepartamento(db: MockDb, value: unknown) {
  const departamento = db.departamentos.find(
    (item) => item.idDepartamento === Number(value) && item.departamentoActivo !== false,
  )
  if (!departamento) {
    throw httpError(409, 'El departamento no existe o está inactivo')
  }
  return {
    idDepartamento: departamento.idDepartamento,
    nombreDepartamento: departamento.nombreDepartamento,
    departamentoActivo: departamento.departamentoActivo,
  }
}

function buscarProveedores(db: MockDb, params: Record<string, unknown>): Proveedor[] {
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const idDepartamento = toNumber(params.idDepartamento)
  const filtrados: Proveedor[] = []

  for (const proveedor of db.proveedores) {
    if (idDepartamento && proveedor.idDepartamento !== idDepartamento) continue
    if (
      search &&
      !searchMatch(
        [proveedor.nombreProveedor, proveedor.nitProveedor, proveedor.telefonoProveedor],
        search,
      )
    ) {
      continue
    }
    filtrados.push(proveedor)
  }

  return filtrados
}

export function registerProveedoresHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/proveedores$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      return paginate(buscarProveedores(db, params), page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/proveedores\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idProveedor = Number(match[1])
      const proveedor = db.proveedores.find((item) => item.idProveedor === idProveedor)
      if (!proveedor) throw httpError(404, 'No se encontró el proveedor')
      return proveedor
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/proveedores$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateProveedorPayload>(body)
      if (!payload?.nombreProveedor || !payload.nitProveedor) {
        throw httpError(400, 'Datos del proveedor incompletos')
      }

      const nit = payload.nitProveedor.trim()
      if (db.proveedores.some((item) => item.nitProveedor === nit)) {
        throw httpError(409, 'Ya existe un proveedor con ese NIT')
      }

      const departamento = findDepartamento(db, payload.idDepartamento)
      const proveedor: Proveedor = {
        idProveedor: nextId(db.proveedores, (item) => item.idProveedor),
        nombreProveedor: payload.nombreProveedor.trim(),
        nitProveedor: nit,
        telefonoProveedor: payload.telefonoProveedor?.trim() || null,
        idDepartamento: departamento.idDepartamento,
        departamento,
      }

      db.proveedores.push(proveedor)
      saveDb()
      return proveedor
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/proveedores\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idProveedor = Number(match[1])
      const proveedor = db.proveedores.find((item) => item.idProveedor === idProveedor)
      if (!proveedor) throw httpError(404, 'No se encontró el proveedor')

      const payload = parseBody<UpdateProveedorPayload>(body)
      if (!payload) throw httpError(400, 'Datos del proveedor incompletos')

      if (payload.nitProveedor !== undefined) {
        const nit = payload.nitProveedor.trim()
        if (db.proveedores.some((item) => item.idProveedor !== idProveedor && item.nitProveedor === nit)) {
          throw httpError(409, 'Ya existe un proveedor con ese NIT')
        }
        proveedor.nitProveedor = nit
      }

      if (payload.nombreProveedor !== undefined) proveedor.nombreProveedor = payload.nombreProveedor.trim()
      if (payload.telefonoProveedor !== undefined) {
        proveedor.telefonoProveedor = payload.telefonoProveedor.trim() || null
      }
      if (payload.idDepartamento !== undefined) {
        const departamento = findDepartamento(db, payload.idDepartamento)
        proveedor.idDepartamento = departamento.idDepartamento
        proveedor.departamento = departamento
      }

      saveDb()
      return proveedor
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/proveedores\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idProveedor = Number(match[1])
      const existe = db.proveedores.some((item) => item.idProveedor === idProveedor)
      if (!existe) throw httpError(404, 'No se encontró el proveedor')

      db.proveedores = db.proveedores.filter((item) => item.idProveedor !== idProveedor)
      saveDb()
      return { success: true }
    },
  })
}
