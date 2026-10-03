import { loadDb, nextId, saveDb, type MockDb, type MockUsuario } from '../db'
import { registerRoute } from '../registry'
import { httpError, paginate, parseBody, searchMatch, toNumber } from '../utils'
import { buildUsuarioPerfil } from './shared'
import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
} from '../../modules/administracion/types/usuario'

function buildUsuarioRol(db: MockDb, usuario: MockUsuario) {
  const usuarioRol: Array<{
    idUsuario: number
    idRol: number
    rol: { idRol: number; nombreRol: string }
  }> = []

  for (const rol of db.roles) {
    if (usuario.idRoles.includes(rol.idRol)) {
      usuarioRol.push({
        idUsuario: usuario.idUsuario,
        idRol: rol.idRol,
        rol: { idRol: rol.idRol, nombreRol: rol.nombreRol },
      })
    }
  }

  return usuarioRol
}

function buildUsuarioSucursal(usuario: MockUsuario) {
  return usuario.idSucursales.map((idSucursal) => ({
    idUsuario: usuario.idUsuario,
    idSucursal,
  }))
}

export function registerAdministracionHandlers(): void {
  registerRoute({
    method: 'GET',
    pattern: /^\/usuarios$/,
    handler: ({ params }) => {
      const db = loadDb()
      const page = toNumber(params.page) ?? 1
      const limit = toNumber(params.limit) ?? 10
      const search = typeof params.search === 'string' ? params.search.trim() : ''

      const filtrados: MockUsuario[] = []
      for (const usuario of db.usuarios) {
        if (!usuario.usuarioActivo) continue
        if (search && !searchMatch([usuario.nombreUsuario, usuario.apellidoUsuario, usuario.correoUsuario], search)) {
          continue
        }
        filtrados.push(usuario)
      }

      const { data, meta } = paginate(filtrados, page, limit)
      return {
        data: data.map((usuario) => ({
          idUsuario: usuario.idUsuario,
          nombreUsuario: usuario.nombreUsuario,
          apellidoUsuario: usuario.apellidoUsuario,
          correoUsuario: usuario.correoUsuario,
          usuarioRol: buildUsuarioRol(db, usuario),
        })),
        meta,
      }
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/usuarios\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idUsuario = Number(match[1])
      const usuario = db.usuarios.find((item) => item.idUsuario === idUsuario)
      if (!usuario) throw httpError(404, 'No se encontró el usuario')

      return {
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        apellidoUsuario: usuario.apellidoUsuario,
        correoUsuario: usuario.correoUsuario,
        usuarioActivo: usuario.usuarioActivo,
        usuarioRol: buildUsuarioRol(db, usuario),
        usuarioSucursal: buildUsuarioSucursal(usuario),
      }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/usuarios$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<CreateUsuarioPayload>(body)
      if (!payload?.nombreUsuario || !payload.correoUsuario) {
        throw httpError(400, 'Datos del usuario incompletos')
      }

      const correo = payload.correoUsuario.trim().toLowerCase()
      const existente = db.usuarios.find(
        (item) => item.correoUsuario.toLowerCase() === correo,
      )
      if (existente) throw httpError(409, 'Ya existe un usuario con ese correo')

      const usuario: MockUsuario = {
        idUsuario: nextId(db.usuarios, (item) => item.idUsuario),
        nombreUsuario: payload.nombreUsuario.trim(),
        apellidoUsuario: payload.apellidoUsuario.trim(),
        correoUsuario: payload.correoUsuario.trim(),
        passwordUsuario: payload.passwordUsuario,
        usuarioActivo: true,
        idRoles: payload.idRoles ?? [],
        idSucursales: [],
      }
      db.usuarios.push(usuario)
      saveDb()
      return { idUsuario: usuario.idUsuario }
    },
  })

  registerRoute({
    method: 'PATCH',
    pattern: /^\/usuarios\/(\d+)$/,
    handler: ({ match, body }) => {
      const db = loadDb()
      const idUsuario = Number(match[1])
      const usuario = db.usuarios.find((item) => item.idUsuario === idUsuario)
      if (!usuario) throw httpError(404, 'No se encontró el usuario')

      const payload = parseBody<UpdateUsuarioPayload>(body)
      if (!payload) throw httpError(400, 'Datos del usuario incompletos')

      if (payload.correoUsuario) {
        const correo = payload.correoUsuario.trim().toLowerCase()
        const existente = db.usuarios.find(
          (item) => item.idUsuario !== idUsuario && item.correoUsuario.toLowerCase() === correo,
        )
        if (existente) throw httpError(409, 'Ya existe un usuario con ese correo')
        usuario.correoUsuario = payload.correoUsuario.trim()
      }

      usuario.nombreUsuario = payload.nombreUsuario.trim()
      usuario.apellidoUsuario = payload.apellidoUsuario.trim()
      if (payload.passwordUsuario) usuario.passwordUsuario = payload.passwordUsuario
      if (payload.usuarioActivo !== undefined) usuario.usuarioActivo = payload.usuarioActivo
      usuario.idRoles = payload.idRoles ?? usuario.idRoles

      saveDb()
      return buildUsuarioPerfil(db, usuario)
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/usuarios\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idUsuario = Number(match[1])
      const usuario = db.usuarios.find((item) => item.idUsuario === idUsuario)
      if (!usuario) throw httpError(404, 'No se encontró el usuario')

      usuario.usuarioActivo = false
      saveDb()
      return { success: true }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/usuario-sucursales$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<{ idUsuario?: number; idSucursal?: number }>(body)
      const idUsuario = Number(payload?.idUsuario)
      const idSucursal = Number(payload?.idSucursal)

      const usuario = db.usuarios.find((item) => item.idUsuario === idUsuario)
      if (!usuario) throw httpError(404, 'No se encontró el usuario')

      if (!usuario.idSucursales.includes(idSucursal)) {
        usuario.idSucursales.push(idSucursal)
        saveDb()
      }
      return { success: true }
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/usuario-sucursales\/(\d+)\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idUsuario = Number(match[1])
      const idSucursal = Number(match[2])
      const usuario = db.usuarios.find((item) => item.idUsuario === idUsuario)
      if (!usuario) throw httpError(404, 'No se encontró el usuario')

      usuario.idSucursales = usuario.idSucursales.filter((item) => item !== idSucursal)
      saveDb()
      return { success: true }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/roles$/,
    handler: ({ body }) => {
      const db = loadDb()
      const nombreRol = parseBody<{ nombreRol?: string }>(body)?.nombreRol?.trim()
      if (!nombreRol) throw httpError(400, 'El nombre del rol es obligatorio')

      const existente = db.roles.find(
        (rol) => rol.nombreRol.toLowerCase() === nombreRol.toLowerCase(),
      )
      if (existente) throw httpError(409, 'Ya existe un rol con ese nombre')

      const rol = { idRol: nextId(db.roles, (item) => item.idRol), nombreRol }
      db.roles.push(rol)
      saveDb()
      return rol
    },
  })

  registerRoute({
    method: 'GET',
    pattern: /^\/roles\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idRol = Number(match[1])
      const rol = db.roles.find((item) => item.idRol === idRol)
      if (!rol) throw httpError(404, 'No se encontró el rol')

      const rolPermiso = db.rolPermisos
        .filter((item) => item.idRol === idRol)
        .map((item) => ({ idRol: item.idRol, idPermiso: item.idPermiso }))

      return { idRol: rol.idRol, nombreRol: rol.nombreRol, rolPermiso }
    },
  })

  registerRoute({
    method: 'POST',
    pattern: /^\/rol-permisos$/,
    handler: ({ body }) => {
      const db = loadDb()
      const payload = parseBody<{ idRol?: number; idPermiso?: number }>(body)
      const idRol = Number(payload?.idRol)
      const idPermiso = Number(payload?.idPermiso)

      const existe = db.rolPermisos.some(
        (item) => item.idRol === idRol && item.idPermiso === idPermiso,
      )
      if (!existe) {
        db.rolPermisos.push({ idRol, idPermiso })
        saveDb()
      }
      return { idRol, idPermiso }
    },
  })

  registerRoute({
    method: 'DELETE',
    pattern: /^\/rol-permisos\/(\d+)\/(\d+)$/,
    handler: ({ match }) => {
      const db = loadDb()
      const idRol = Number(match[1])
      const idPermiso = Number(match[2])

      db.rolPermisos = db.rolPermisos.filter(
        (item) => !(item.idRol === idRol && item.idPermiso === idPermiso),
      )
      saveDb()
      return { success: true }
    },
  })
}
