import axiosInstance from '../../../lib/axios'
import type {
  InventarioSucursal,
  InventarioSucursalFilters,
  InventarioSucursalResponse,
  CreateInventarioSucursalDto,
  UpdateInventarioSucursalDto,
  SucursalInventario,
} from '../types/inventarioSucursal'
import type { Producto } from '../types/producto'

export const inventarioSucursalService = {
  async getInventarios(
    filters: InventarioSucursalFilters = {},
    signal?: AbortSignal,
  ): Promise<InventarioSucursalResponse> {
    const params: Record<string, string | number | boolean> = {}

    if (filters.page) params.page = filters.page
    if (filters.limit) params.limit = filters.limit
    if (filters.idProducto) params.idProducto = filters.idProducto
    if (filters.idSucursal) params.idSucursal = filters.idSucursal
    if (filters.stockBajo !== undefined) params.stockBajo = filters.stockBajo

    const response = await axiosInstance.get<InventarioSucursalResponse>(
      '/inventario-sucursal',
      {
        params,
        signal,
      },
    )
    return response.data
  },

  async getInventarioById(
    id: number,
    signal?: AbortSignal,
  ): Promise<InventarioSucursal> {
    const response = await axiosInstance.get<InventarioSucursal>(
      `/inventario-sucursal/${id}`,
      { signal },
    )
    return response.data
  },

  async createInventario(
    data: CreateInventarioSucursalDto,
  ): Promise<InventarioSucursal> {
    const response = await axiosInstance.post<InventarioSucursal>(
      '/inventario-sucursal',
      data,
    )
    return response.data
  },

  async updateInventario(
    id: number,
    data: UpdateInventarioSucursalDto,
  ): Promise<InventarioSucursal> {
    const response = await axiosInstance.patch<InventarioSucursal>(
      `/inventario-sucursal/${id}`,
      data,
    )
    return response.data
  },

  async deleteInventario(id: number): Promise<InventarioSucursal> {
    const response = await axiosInstance.delete<InventarioSucursal>(
      `/inventario-sucursal/${id}`,
    )
    return response.data
  },

  async getSucursales(signal?: AbortSignal): Promise<SucursalInventario[]> {
    try {
      const response = await axiosInstance.get<SucursalInventario[] | { data: SucursalInventario[] }>(
        '/sucursales',
        { signal },
      )
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data && Array.isArray((response.data as { data: SucursalInventario[] }).data)) {
        return (response.data as { data: SucursalInventario[] }).data
      }
      return []
    } catch {
      return []
    }
  },

  async getProductos(params?: {
    search?: string
    scopeSucursal?: boolean
    signal?: AbortSignal
  }): Promise<Producto[]> {
    const query: Record<string, string | number | boolean> = { limit: 100 }
    if (params?.search) query.search = params.search
    if (params?.scopeSucursal !== undefined) query.scopeSucursal = params.scopeSucursal

    try {
      const response = await axiosInstance.get<Producto[] | { data: Producto[] }>(
        '/productos',
        {
          params: query,
          signal: params?.signal,
        },
      )
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (response.data && Array.isArray((response.data as { data: Producto[] }).data)) {
        return (response.data as { data: Producto[] }).data
      }
      return []
    } catch {
      return []
    }
  },
}
