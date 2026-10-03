import { getSession, type MockDb, type MockUsuario } from '../db'

export interface BackendRolRef {
  idRol: number
  nombreRol: string
}

export interface UsuarioRef {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
}

export function getUsuarioSesion(db: MockDb): MockUsuario | null {
  const session = getSession()
  if (!session) return null
  return (
    db.usuarios.find((item) => item.idUsuario === session.idUsuario && item.usuarioActivo) ?? null
  )
}

export function toUsuarioRef(usuario: MockUsuario): UsuarioRef {
  return {
    idUsuario: usuario.idUsuario,
    nombreUsuario: usuario.nombreUsuario,
    apellidoUsuario: usuario.apellidoUsuario,
    correoUsuario: usuario.correoUsuario,
  }
}

export interface BackendSucursalRef {
  idSucursal: number
  nombreSucursal: string
}

export interface BackendUsuarioPerfil {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioActivo: boolean
  roles: BackendRolRef[]
  sucursales: BackendSucursalRef[]
}

export function buildRolesUsuario(db: MockDb, usuario: MockUsuario): BackendRolRef[] {
  const roles: BackendRolRef[] = []
  for (const rol of db.roles) {
    if (usuario.idRoles.includes(rol.idRol)) {
      roles.push({ idRol: rol.idRol, nombreRol: rol.nombreRol })
    }
  }
  return roles
}

export function buildSucursalesUsuario(
  db: MockDb,
  usuario: MockUsuario,
): BackendSucursalRef[] {
  const sucursales: BackendSucursalRef[] = []
  for (const sucursal of db.sucursales) {
    if (usuario.idSucursales.includes(sucursal.idSucursal)) {
      sucursales.push({
        idSucursal: sucursal.idSucursal,
        nombreSucursal: sucursal.nombreSucursal,
      })
    }
  }
  return sucursales
}

export function buildPermisosUsuario(db: MockDb, usuario: MockUsuario): string[] {
  const idsPermiso = new Set<number>()
  for (const rolPermiso of db.rolPermisos) {
    if (usuario.idRoles.includes(rolPermiso.idRol)) {
      idsPermiso.add(rolPermiso.idPermiso)
    }
  }

  const nombres: string[] = []
  for (const permiso of db.permisos) {
    if (idsPermiso.has(permiso.idPermiso)) {
      nombres.push(permiso.nombrePermiso)
    }
  }
  return nombres
}

export function buildUsuarioPerfil(db: MockDb, usuario: MockUsuario): BackendUsuarioPerfil {
  return {
    idUsuario: usuario.idUsuario,
    nombreUsuario: usuario.nombreUsuario,
    apellidoUsuario: usuario.apellidoUsuario,
    correoUsuario: usuario.correoUsuario,
    usuarioActivo: usuario.usuarioActivo,
    roles: buildRolesUsuario(db, usuario),
    sucursales: buildSucursalesUsuario(db, usuario),
  }
}
