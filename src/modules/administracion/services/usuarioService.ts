import api from '../../../lib/axios'
import type { User } from '../../../types/user'
import type {
  CreateUsuarioPayload,
  Permiso,
  Rol,
  Sucursal,
  UpdateUsuarioPayload,
  UsuarioDetalle,
  UsuariosMeta,
  UsuariosQuery,
  UsuariosResponse,
} from '../types/usuario'

export interface UsuariosResult {
  data: User[]
  meta: UsuariosMeta
}

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'data' in value) {
    const data = value.data
    if (Array.isArray(data)) return data as T[]
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data as T[]
    }
  }
  return []
}

function mapUsuario(backendUsuario: UsuariosResponse['data'][number]): User {
  let roleNames: string[] = []

  if (Array.isArray(backendUsuario.usuarioRol) && backendUsuario.usuarioRol.length > 0) {
    roleNames = backendUsuario.usuarioRol
      .map((ur) => ur.rol?.nombreRol)
      .filter((name): name is string => Boolean(name))
  } else if (backendUsuario.rol?.nombreRol) {
    roleNames = [backendUsuario.rol.nombreRol]
  }

  return {
    id: backendUsuario.idUsuario,
    nombreCompleto: `${backendUsuario.nombreUsuario} ${backendUsuario.apellidoUsuario}`.trim(),
    correoElectronico: backendUsuario.correoUsuario,
    rolAsignado: roleNames.length > 0 ? roleNames.join(', ') : 'Sin rol',
    activo: true,
  }
}

export const usuarioService = {
  async getAll(query: UsuariosQuery = {}): Promise<UsuariosResult> {
    const { data } = await api.get<UsuariosResponse>('/usuarios', {
      params: query,
    })

    return {
      data: data.data.map(mapUsuario),
      meta: data.meta,
    }
  },

  async getRoles(): Promise<Rol[]> {
    try {
      const { data } = await api.get<Rol[]>('/roles')
      return unwrapList<Rol>(data)
    } catch {
      return []
    }
  },

  async createRol(nombreRol: string): Promise<Rol> {
    const { data } = await api.post<Rol>('/roles', { nombreRol })
    return data
  },

  async getSucursales(): Promise<Sucursal[]> {
    try {
      const { data } = await api.get<Sucursal[] | { data?: Sucursal[] }>('/sucursales', {
        params: { limit: 1000 },
      })
      return unwrapList<Sucursal>(data)
    } catch {
      return []
    }
  },

  async getPermisos(): Promise<Permiso[]> {
    try {
      const { data } = await api.get<Permiso[]>('/permisos')
      return unwrapList<Permiso>(data)
    } catch {
      return []
    }
  },

  async create(payload: CreateUsuarioPayload): Promise<{ idUsuario: number }> {
    const { data } = await api.post<{ idUsuario: number }>('/usuarios', payload)
    return data
  },

  async getById(id: number): Promise<UsuarioDetalle> {
    const { data } = await api.get<Record<string, unknown>>(`/usuarios/${id}`)

    const usuarioRol = Array.isArray(data.usuarioRol)
      ? (data.usuarioRol as { idRol?: number; rol?: { idRol?: number; nombreRol?: string } }[])
      : []

    const idRoles: number[] = usuarioRol.reduce<number[]>((acc, ur) => {
      const id = Number(ur.idRol || ur.rol?.idRol)
      if (!isNaN(id) && id > 0) acc.push(id)
      return acc
    }, [])

    const rolesNombres: string[] = usuarioRol.reduce<string[]>((acc, ur) => {
      const nombre = ur.rol?.nombreRol
      if (nombre) acc.push(nombre)
      return acc
    }, [])

    // Fallback retrocompatible si viene rol singular
    if (idRoles.length === 0 && data.idRol) {
      idRoles.push(Number(data.idRol))
    }

    const sucursales = Array.isArray(data.usuarioSucursal)
      ? (data.usuarioSucursal as { idSucursal?: number }[]).reduce<number[]>((acc, s) => {
          const n = Number(s.idSucursal)
          if (n > 0) acc.push(n)
          return acc
        }, [])
      : []

    return {
      idUsuario: Number(data.idUsuario ?? id),
      nombreUsuario: String(data.nombreUsuario ?? ''),
      apellidoUsuario: String(data.apellidoUsuario ?? ''),
      correoUsuario: String(data.correoUsuario ?? ''),
      usuarioActivo: Boolean(data.usuarioActivo ?? true),
      idRoles,
      rolesNombres,
      sucursales,
    }
  },

  async update(id: number, payload: UpdateUsuarioPayload): Promise<void> {
    await api.patch(`/usuarios/${id}`, payload)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },

  async getRolPermisos(idRol: number): Promise<number[]> {
    try {
      const numericIdRol = Number(idRol)
      const { data } = await api.get<Record<string, unknown>>(`/roles/${numericIdRol}`)
      const rolData =
        data && typeof data === 'object' && 'data' in data && data.data
          ? (data.data as Record<string, unknown>)
          : data

      const rolPermisoList = (rolData?.rolPermiso ?? (rolData as Record<string, unknown>)?.rol_permiso ?? []) as {
        idPermiso?: number | string
      }[]

      if (Array.isArray(rolPermisoList) && rolPermisoList.length > 0) {
        return rolPermisoList.reduce<number[]>((acc, rp) => {
          const id = Number(rp.idPermiso)
          if (!isNaN(id) && id > 0) acc.push(id)
          return acc
        }, [])
      }

      // Fallback a consulta general de /rol-permisos
      const { data: allRolPermisos } = await api.get<unknown>('/rol-permisos')
      const items = unwrapList<{ idRol?: number | string; idPermiso?: number | string }>(allRolPermisos)
      return items.reduce<number[]>((acc, item) => {
        if (Number(item.idRol) === numericIdRol) {
          const id = Number(item.idPermiso)
          if (!isNaN(id) && id > 0) acc.push(id)
        }
        return acc
      }, [])
    } catch {
      return []
    }
  },

  async createRolPermiso(idRol: number, idPermiso: number): Promise<void> {
    await api.post('/rol-permisos', { idRol: Number(idRol), idPermiso: Number(idPermiso) })
  },

  async deleteRolPermiso(idRol: number, idPermiso: number): Promise<void> {
    await api.delete(`/rol-permisos/${Number(idRol)}/${Number(idPermiso)}`)
  },

  async assignSucursal(idUsuario: number, idSucursal: number): Promise<void> {
    await api.post('/usuario-sucursales', { idUsuario, idSucursal })
  },

  async removeSucursal(idUsuario: number, idSucursal: number): Promise<void> {
    await api.delete(`/usuario-sucursales/${idUsuario}/${idSucursal}`)
  },
}
