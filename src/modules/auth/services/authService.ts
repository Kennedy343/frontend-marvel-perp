import { isAxiosError } from 'axios'
import api from '../../../lib/axios'
import type { BackendProfile, LoginCredentials, LoginResponse } from '../../../types/auth'
import type { User } from '../../../types/user'

interface BackendUserSource {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  usuarioActivo: boolean
  roles?: { idRol: number; nombreRol: string }[] | null
  sucursales?: { idSucursal: number; nombreSucursal: string }[] | null
  permisos?: string[] | null
}

function mapBackendUser(usuario: BackendUserSource): User {
  const sucursales = (usuario.sucursales ?? []).map((s) => ({
    idSucursal: s.idSucursal,
    nombreSucursal: s.nombreSucursal,
  }))
  const sucursal = sucursales.length === 1 ? sucursales[0] : null
  const roleNames = (usuario.roles ?? []).flatMap((r) => (r.nombreRol ? [r.nombreRol] : []))
  const rolAsignado = roleNames.length > 0 ? roleNames.join(', ') : 'Sin rol'

  return {
    id: usuario.idUsuario,
    nombreCompleto:
      `${usuario.nombreUsuario} ${usuario.apellidoUsuario}`.trim(),
    correoElectronico: usuario.correoUsuario,
    rolAsignado,
    activo: usuario.usuarioActivo,
    idSucursal: sucursal?.idSucursal ?? null,
    nombreSucursal: sucursal?.nombreSucursal ?? null,
    sucursales,
    permisos: usuario.permisos ?? [],
  }
}

function normalizeAuthError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401) return 'Credenciales inválidas'
    if (status === 429) return 'Demasiados intentos. Intenta de nuevo en un minuto'
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message[0] as string
    if (typeof message === 'string') return message
    return 'Ocurrió un error. Intenta de nuevo'
  }
  return 'No se pudo conectar con el servidor'
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)
      return {
        accessToken: data.accessToken,
        user: mapBackendUser(data.usuario),
      }
    } catch (error) {
      throw new Error(normalizeAuthError(error), { cause: error })
    }
  },

  async logout() {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<BackendProfile>('/auth/me')
    return mapBackendUser(data)
  },
}