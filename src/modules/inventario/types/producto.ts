export interface CategoriaProducto {
  idCategoria: number
  nombreCategoria: string
}

export interface ProductoCategoria {
  idProducto: number
  idCategoria: number
  categoriaProducto: CategoriaProducto
}

export interface InventarioProducto {
  idInventario: number
  idProducto: number
  idSucursal: number
  stockActual: number
  stockMinimo: number
  activo: boolean
  sucursal?: {
    idSucursal: number
    codigoSucursal: string
    nombreSucursal: string
  } | null
}

export interface Producto {
  idProducto: number
  codigoProducto: string
  nombreProducto: string
  descripcion?: string | null
  ultimoCosto: number
  activo: boolean
  productoCategoria: ProductoCategoria[]
  inventarios?: InventarioProducto[]
}

export interface ProductosMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductosResponse {
  data: Producto[]
  meta: ProductosMeta
}

export interface ProductosQuery {
  page?: number
  limit?: number
  search?: string
  scopeSucursal?: boolean
}

export interface CreateProductoDto {
  codigoProducto: string
  nombreProducto: string
  descripcion?: string
  ultimoCosto?: number
  activo?: boolean
  categorias?: number[]
}

export interface ProductoFormData {
  codigoProducto: string
  nombreProducto: string
  descripcion: string
  ultimoCosto: string
  categorias: number[]
}