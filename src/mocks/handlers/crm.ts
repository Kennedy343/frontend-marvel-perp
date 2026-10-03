import { loadDb, nextId, saveDb, type MockDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toNumber } from '../utils'
import type {
  Client,
  ClientRelation,
  CreateClientPayload,
  UpdateClientPayload,
} from '../../modules/crm/types/client'

function findComunidad(db: MockDb, value: unknown): ClientRelation | null {
  if (value == null || value === '') return null
  const comunidad = db.comunidades.find((item) => item.idComunidad === Number(value))
  if (!comunidad) return null
  return { idComunidad: comunidad.idComunidad, nombreComunidad: comunidad.nombreComunidad }
}

function findCategoria(db: MockDb, value: unknown): ClientRelation | null {
  if (value == null || value === '') return null
  const categoria = db.categoriasCliente.find((item) => item.idCategoria === Number(value))
  if (!categoria) return null
  return { idCategoria: categoria.idCategoria, nombreCategoria: categoria.nombreCategoria }
}

function findSucursal(db: MockDb, value: unknown): ClientRelation | null {
  if (value == null || value === '') return null
  const sucursal = db.sucursales.find((item) => item.idSucursal === Number(value))
  if (!sucursal) return null
  return { idSucursal: sucursal.idSucursal, nombreSucursal: sucursal.nombreSucursal }
}

function findSector(db: MockDb, value: unknown): ClientRelation | null {
  if (value == null || value === '') return null
  const sector = db.sectores.find((item) => item.idSector === Number(value))
  if (!sector) return null
  return { idSector: sector.idSector, nombreSector: sector.nombreSector }
}

function buscarClientes(db: MockDb, params: Record<string, unknown>): Client[] {
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const idSucursal = toNumber(params.idSucursal)
  const filtrados: Client[] = []

  for (const cliente of db.clientes) {
    if (idSucursal && cliente.sucursal?.idSucursal !== idSucursal) continue
    if (
      search &&
      !searchMatch(
        [
          cliente.primerNombre,
          cliente.segundoNombre,
          cliente.primerApellido,
          cliente.segundoApellido,
          cliente.dpiCliente,
          cliente.nit,
          cliente.telefono,
        ],
        search,
      )
    ) {
      continue
    }
    filtrados.push(cliente)
  }

  return filtrados
}

export function registerCrmHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/clientes$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      return paginate(buscarClientes(db, params), page, limit)
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/clientes\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idCliente = Number(match[1])
      const cliente = db.clientes.find((item) => item.idCliente === idCliente)
      if (!cliente) throw httpError(404, 'No se encontró el cliente')
      return cliente
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/clientes$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateClientPayload>(body)
      if (!payload?.dpiCliente || !payload.primerNombre || !payload.primerApellido) {
        throw httpError(400, 'Datos del cliente incompletos')
      }

      const dpi = payload.dpiCliente.trim()
      if (db.clientes.some((item) => item.dpiCliente === dpi)) {
        throw httpError(409, 'Ya existe un cliente con ese DPI')
      }

      const cliente: Client = {
        idCliente: nextId(db.clientes, (item) => item.idCliente),
        primerNombre: payload.primerNombre.trim(),
        segundoNombre: payload.segundoNombre?.trim() || null,
        primerApellido: payload.primerApellido.trim(),
        segundoApellido: payload.segundoApellido?.trim() || null,
        telefono: payload.telefono?.trim() || null,
        dpiCliente: dpi,
        nit: payload.nit?.trim() || null,
        comunidad: findComunidad(db, payload.idComunidad),
        categoria: findCategoria(db, payload.idCategoria),
        sucursal: findSucursal(db, payload.idSucursal),
        sector: findSector(db, payload.idSector),
      }

      db.clientes.push(cliente)
      saveDb()
      return cliente
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/clientes\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idCliente = Number(match[1])
      const cliente = db.clientes.find((item) => item.idCliente === idCliente)
      if (!cliente) throw httpError(404, 'No se encontró el cliente')

      const payload = parseBody<UpdateClientPayload>(body)
      if (!payload) throw httpError(400, 'Datos del cliente incompletos')

      if (payload.dpiCliente !== undefined) {
        const dpi = payload.dpiCliente.trim()
        if (db.clientes.some((item) => item.idCliente !== idCliente && item.dpiCliente === dpi)) {
          throw httpError(409, 'Ya existe un cliente con ese DPI')
        }
        cliente.dpiCliente = dpi
      }

      if (payload.primerNombre !== undefined) cliente.primerNombre = payload.primerNombre.trim()
      if (payload.segundoNombre !== undefined) cliente.segundoNombre = payload.segundoNombre.trim() || null
      if (payload.primerApellido !== undefined) cliente.primerApellido = payload.primerApellido.trim()
      if (payload.segundoApellido !== undefined) cliente.segundoApellido = payload.segundoApellido.trim() || null
      if (payload.telefono !== undefined) cliente.telefono = payload.telefono.trim() || null
      if (payload.nit !== undefined) cliente.nit = payload.nit.trim() || null

      if (payload.idComunidad !== undefined) cliente.comunidad = findComunidad(db, payload.idComunidad)
      if (payload.idCategoria !== undefined) cliente.categoria = findCategoria(db, payload.idCategoria)
      if (payload.idSucursal !== undefined) cliente.sucursal = findSucursal(db, payload.idSucursal)
      if (payload.idSector !== undefined) cliente.sector = findSector(db, payload.idSector)

      saveDb()
      return cliente
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/clientes\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idCliente = Number(match[1])
      const existe = db.clientes.some((item) => item.idCliente === idCliente)
      if (!existe) throw httpError(404, 'No se encontró el cliente')

      db.clientes = db.clientes.filter((item) => item.idCliente !== idCliente)
      saveDb()
      return { success: true }
    },
  })
}
