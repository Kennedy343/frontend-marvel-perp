import api from '../../../lib/axios'
import type {
  CategoriaCliente,
  Client,
  ClientsQuery,
  ClientsResponse,
  Comunidad,
  CreateClientPayload,
  Departamento,
  Municipio,
  Sector,
  SucursalOption,
  UpdateClientPayload,
} from '../types/client'

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

export const clientService = {
  async getAll(query: ClientsQuery = {}, signal?: AbortSignal): Promise<ClientsResponse> {
    const { data } = await api.get<ClientsResponse>('/clientes', {
      params: query,
      signal,
    })

    return data
  },

  async getById(id: number | string): Promise<Client> {
    const { data } = await api.get<Client | { data: Client }>(`/clientes/${id}`)
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data
    }
    return data as Client
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await api.post<Client>('/clientes', payload)
    return data
  },

  async update(id: number | string, payload: UpdateClientPayload): Promise<Client> {
    const { data } = await api.patch<Client>(`/clientes/${id}`, payload)
    return data
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/clientes/${id}`)
  },

  async getSectores(): Promise<Sector[]> {
    try {
      const { data } = await api.get<Sector[]>('/sectores')
      return unwrapList<Sector>(data)
    } catch {
      return []
    }
  },

  async getComunidades(): Promise<Comunidad[]> {
    try {
      const { data } = await api.get<{ data: Comunidad[] }>('/comunidades', {
        params: { limit: 1000 },
      })
      return unwrapList<Comunidad>(data)
    } catch {
      return []
    }
  },

  async getCategorias(): Promise<CategoriaCliente[]> {
    try {
      const { data } = await api.get<CategoriaCliente[]>('/categorias')
      return unwrapList(data)
    } catch {
      return []
    }
  },

  async getSucursales(): Promise<SucursalOption[]> {
    try {
      const { data } = await api.get<SucursalOption[] | { data?: SucursalOption[] }>('/sucursales')
      return unwrapList<SucursalOption>(data).filter((item) => item.sucursalActiva !== false)
    } catch {
      return []
    }
  },

  async getDepartamentos(): Promise<Departamento[]> {
    try {
      const { data } = await api.get<Departamento[] | { data?: Departamento[] }>('/departamentos', {
        params: { limit: 1000 },
      })
      return unwrapList(data)
    } catch {
      return []
    }
  },

  async getMunicipios(): Promise<Municipio[]> {
    try {
      const { data } = await api.get<Municipio[] | { data?: Municipio[] }>('/municipios', {
        params: { limit: 1000 },
      })
      return unwrapList(data)
    } catch {
      return []
    }
  },

  async createSector(nombreSector: string): Promise<Sector> {
    const { data } = await api.post<Sector>('/sectores', { nombreSector })
    return data
  },

  async createDepartamento(nombreDepartamento: string): Promise<Departamento> {
    const { data } = await api.post<Departamento>('/departamentos', { nombreDepartamento })
    return data
  },

  async createMunicipio(nombreMunicipio: string, idDepartamento: number): Promise<Municipio> {
    const { data } = await api.post<Municipio>('/municipios', { nombreMunicipio, idDepartamento })
    return data
  },

  async createComunidad(nombreComunidad: string, idMunicipio: number): Promise<Comunidad> {
    const { data } = await api.post<Comunidad>('/comunidades', { nombreComunidad, idMunicipio })
    return data
  },

  async createCategoria(nombreCategoria: string): Promise<CategoriaCliente> {
    const { data } = await api.post<CategoriaCliente>('/categorias', { nombreCategoria })
    return data
  },
}
