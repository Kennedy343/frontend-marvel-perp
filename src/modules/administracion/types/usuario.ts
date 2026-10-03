export interface BackendUsuarioRol {
  idUsuario?: number
  idRol?: number
  rol?: {
    idRol: number
    nombreRol: string
  }
}

export interface BackendUsuario {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioRol?: BackendUsuarioRol[]
  rol?: { nombreRol: string } // Fallback
}

export interface UsuariosMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UsuariosResponse {
  data: BackendUsuario[]
  meta: UsuariosMeta
}

export interface UsuariosQuery {
  page?: number
  limit?: number
  search?: string
}

export interface Rol {
  idRol: number
  nombreRol: string
}

export interface Sucursal {
  idSucursal: number
  nombreSucursal: string
}

export interface Permiso {
  idPermiso: number
  nombrePermiso: string
}

export interface CreateUsuarioPayload {
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  passwordUsuario: string
  idRoles: number[]
}

export interface UsuarioInfoForm {
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  passwordUsuario: string
}

export interface UsuarioInfoErrors {
  nombreUsuario?: string
  apellidoUsuario?: string
  correoUsuario?: string
  passwordUsuario?: string
  idRoles?: string
  sucursales?: string
}

export interface PermisoModulo {
  recurso: string
  acciones: { accion: string; idPermiso: number }[]
}

export interface UsuarioDetalle {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioActivo: boolean
  idRoles: number[]
  rolesNombres?: string[]
  sucursales: number[]
}

export interface UpdateUsuarioPayload {
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  passwordUsuario?: string
  usuarioActivo?: boolean
  idRoles: number[]
}


