import { loadDb, nextId, saveDb } from '../db'
import { registerRoute } from '../registry'
import { httpError, parseBody } from '../utils'

export function registerCatalogosHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/sucursales$/,
    handler: () => loadDb().sucursales,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/departamentos$/,
    handler: () => loadDb().departamentos,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/municipios$/,
    handler: () => loadDb().municipios,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/comunidades$/,
    handler: () => loadDb().comunidades,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/sectores$/,
    handler: () => loadDb().sectores,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/categorias$/,
    handler: () => loadDb().categoriasCliente,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/tipos-precio$/,
    handler: () => loadDb().tiposPrecio,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/permisos$/,
    handler: () => loadDb().permisos,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/roles$/,
    handler: () => loadDb().roles,
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/rol-permisos$/,
    handler: () => loadDb().rolPermisos,
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/sectores$/,
    handler: ({ body }) => {
      const db = loadDb()
      const nombreSector = parseBody<{ nombreSector?: string }>(body)?.nombreSector?.trim()
      if (!nombreSector) throw httpError(400, 'El nombre del sector es obligatorio')

      const existente = db.sectores.find(
        (sector) => sector.nombreSector.toLowerCase() === nombreSector.toLowerCase(),
      )
      if (existente) throw httpError(409, 'Ya existe un sector con ese nombre')

      const sector = { idSector: nextId(db.sectores, (item) => item.idSector), nombreSector }
      db.sectores.push(sector)
      saveDb()
      return sector
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/departamentos$/,
    handler: ({ body }) => {
      const db = loadDb()
      const nombreDepartamento = parseBody<{ nombreDepartamento?: string }>(
        body,
      )?.nombreDepartamento?.trim()
      if (!nombreDepartamento) {
        throw httpError(400, 'El nombre del departamento es obligatorio')
      }

      const existente = db.departamentos.find(
        (item) => item.nombreDepartamento.toLowerCase() === nombreDepartamento.toLowerCase(),
      )
      if (existente) throw httpError(409, 'Ya existe un departamento con ese nombre')

      const departamento = {
        idDepartamento: nextId(db.departamentos, (item) => item.idDepartamento),
        nombreDepartamento,
        departamentoActivo: true,
      }
      db.departamentos.push(departamento)
      saveDb()
      return departamento
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/municipios$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<{ nombreMunicipio?: string; idDepartamento?: number }>(body)
      const nombreMunicipio = payload?.nombreMunicipio?.trim()
      const idDepartamento = Number(payload?.idDepartamento)

      if (!nombreMunicipio) throw httpError(400, 'El nombre del municipio es obligatorio')
      if (!idDepartamento) throw httpError(400, 'El departamento es obligatorio')

      const municipio = {
        idMunicipio: nextId(db.municipios, (item) => item.idMunicipio),
        nombreMunicipio,
        idDepartamento,
        municipioActivo: true,
      }
      db.municipios.push(municipio)
      saveDb()
      return municipio
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/comunidades$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<{ nombreComunidad?: string; idMunicipio?: number }>(body)
      const nombreComunidad = payload?.nombreComunidad?.trim()
      const idMunicipio = Number(payload?.idMunicipio)

      if (!nombreComunidad) throw httpError(400, 'El nombre de la comunidad es obligatorio')
      if (!idMunicipio) throw httpError(400, 'El municipio es obligatorio')

      const comunidad = {
        idComunidad: nextId(db.comunidades, (item) => item.idComunidad),
        nombreComunidad,
        idMunicipio,
      }
      db.comunidades.push(comunidad)
      saveDb()
      return comunidad
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/categorias$/,
    handler: ({ body }) => {
      const db = loadDb()
      const nombreCategoria = parseBody<{ nombreCategoria?: string }>(body)?.nombreCategoria?.trim()
      if (!nombreCategoria) throw httpError(400, 'El nombre de la categoría es obligatorio')

      const existente = db.categoriasCliente.find(
        (item) => item.nombreCategoria.toLowerCase() === nombreCategoria.toLowerCase(),
      )
      if (existente) throw httpError(409, 'Ya existe una categoría con ese nombre')

      const categoria = {
        idCategoria: nextId(db.categoriasCliente, (item) => item.idCategoria),
        nombreCategoria,
      }
      db.categoriasCliente.push(categoria)
      saveDb()
      return categoria
    },
  })
}
