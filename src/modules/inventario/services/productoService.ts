import api from '../../../lib/axios'
import type { CreateProductoDto, Producto, ProductosQuery, ProductosResponse } from '../types/producto'

export const productoService = {
  async getAll(query: ProductosQuery = {}, signal?: AbortSignal): Promise<ProductosResponse> {
    const { data } = await api.get<ProductosResponse>('/productos', {
      params: query,
      signal,
    })
    return data
  },

  async getById(id: number | string): Promise<Producto> {
    const { data } = await api.get<Producto | { data: Producto }>(`/productos/${id}`)
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data
    }
    return data as Producto
  },

  async create(payload: CreateProductoDto): Promise<Producto> {
    const { data } = await api.post<Producto>('/productos', payload)
    return data
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/productos/${id}`)
  },
}