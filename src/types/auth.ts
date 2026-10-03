import type { User } from './user'

export interface LoginCredentials {
  correoUsuario: string
  passwordUsuario: string
}

export interface BackendUser {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioActivo: boolean
  roles?: { idRol: number; nombreRol: string }[] | null
  sucursales?: { idSucursal: number; nombreSucursal: string }[] | null
}

export interface LoginResponse {
  accessToken: string
  usuario: BackendUser
}

export interface BackendProfile {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioActivo: boolean
  roles?: { idRol: number; nombreRol: string }[] | null
  sucursales?: { idSucursal: number; nombreSucursal: string }[] | null
  permisos?: string[]
}

export interface RefreshResponse {
  accessToken: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
}