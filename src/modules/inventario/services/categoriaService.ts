import api from '../../../lib/axios'
import type {
  CategoriaProducto,
  CategoriasQuery,
  CategoriasResponse,
  CreateCategoriaPayload,
  UpdateCategoriaPayload,
} from '../types/categoria'

export const categoriaService = {
  async getAll(query: CategoriasQuery = {}): Promise<CategoriasResponse> {
    const { data } = await api.get<CategoriasResponse>('/categorias-producto', {
      params: query,
    })
    return data
  },

  async getById(id: number | string): Promise<CategoriaProducto> {
    const { data } = await api.get<CategoriaProducto | { data: CategoriaProducto }>(`/categorias-producto/${id}`)
    if (data && typeof data === 'object' && 'data' in data && data.data) {
      return data.data
    }
    return data as CategoriaProducto
  },

  async create(payload: CreateCategoriaPayload): Promise<CategoriaProducto> {
    const { data } = await api.post<CategoriaProducto>('/categorias-producto', payload)
    return data
  },

  async update(id: number | string, payload: UpdateCategoriaPayload): Promise<CategoriaProducto> {
    const { data } = await api.patch<CategoriaProducto>(`/categorias-producto/${id}`, payload)
    return data
  },

  async remove(id: number | string): Promise<void> {
    await api.delete(`/categorias-producto/${id}`)
  },
}