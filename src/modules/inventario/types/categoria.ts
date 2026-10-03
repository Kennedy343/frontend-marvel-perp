export interface CategoriaProducto {
  idCategoria: number
  nombreCategoria: string
  activo: boolean
}

export interface CategoriasMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CategoriasResponse {
  data: CategoriaProducto[]
  meta: CategoriasMeta
}

export interface CategoriasQuery {
  page?: number
  limit?: number
  search?: string
}

export interface CreateCategoriaPayload {
  nombreCategoria: string
}

export interface UpdateCategoriaPayload {
  nombreCategoria?: string
  activo?: boolean
}

export interface CategoriaFormData {
  nombreCategoria: string
}

export interface CategoriaFormErrors {
  nombreCategoria?: string
}