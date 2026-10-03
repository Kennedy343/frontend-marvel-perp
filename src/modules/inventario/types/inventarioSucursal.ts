import type { Producto } from './producto'

export interface SucursalInventario {
  idSucursal: number
  codigoSucursal: string
  nitSucursal: string
  nombreSucursal: string
  sucursalActiva: boolean
  idDepartamento: number
}

export interface InventarioSucursal {
  idInventario: number
  idProducto: number
  idSucursal: number
  stockActual: number
  stockMinimo: number
  activo: boolean
  producto: Producto
  sucursal: SucursalInventario
}

export interface InventarioSucursalFilters {
  page?: number
  limit?: number
  idProducto?: number
  idSucursal?: number
  stockBajo?: boolean
  search?: string
}

export interface InventarioSucursalResponse {
  data: InventarioSucursal[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateInventarioSucursalDto {
  idProducto: number
  idSucursal: number
  stockActual: number
  stockMinimo: number
}

export interface UpdateInventarioSucursalDto {
  idProducto?: number
  idSucursal?: number
  stockActual?: number
  stockMinimo?: number
  activo?: boolean
}
