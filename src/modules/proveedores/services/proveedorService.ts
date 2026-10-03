import api from '../../../lib/axios'
import type {
  CreateProveedorPayload,
  Departamento,
  Proveedor,
  ProveedoresQuery,
  ProveedoresResponse,
  UpdateProveedorPayload,
} from '../types/proveedor'

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'data' in value) {
    const data = (value as { data: unknown }).data
    if (Array.isArray(data)) return data as T[]
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown }).data)) {
      return (data as { data: T[] }).data
    }
  }
  return []
}

export const proveedorService = {
  async getAll(query: ProveedoresQuery = {}, signal?: AbortSignal): Promise<ProveedoresResponse> {
    const { data } = await api.get<ProveedoresResponse>('/proveedores', {
      params: query,
      signal,
    })
    return data
  },

  async getById(id: number | string): Promise<Proveedor> {
    const { data } = await api.get<Proveedor | { data: Proveedor }>(`/proveedores/${id}`)
    if (data && typeof data === 'object' && 'data' in data && (data as { data: Proveedor }).data) {
      return (data as { data: Proveedor }).data
    }
    return data as Proveedor
  },

  async create(payload: CreateProveedorPayload): Promise<Proveedor> {
    const { data } = await api.post<Proveedor>('/proveedores', payload)
    return data
  },

  async update(id: number | string, payload: UpdateProveedorPayload): Promise<Proveedor> {
    const { data } = await api.patch<Proveedor>(`/proveedores/${id}`, payload)
    return data
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/proveedores/${id}`)
  },

  async getDepartamentos(): Promise<Departamento[]> {
    try {
      const { data } = await api.get<Departamento[] | { data?: Departamento[] }>('/departamentos', {
        params: { limit: 1000 },
      })
      return unwrapList<Departamento>(data)
    } catch {
      return []
    }
  },

  async createDepartamento(nombreDepartamento: string): Promise<Departamento> {
    const { data } = await api.post<Departamento>('/departamentos', { nombreDepartamento })
    return data
  },
}
