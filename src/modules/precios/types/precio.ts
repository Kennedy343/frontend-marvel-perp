export interface TipoPrecio {
  idTipoPrecio: number
  nombreTipoPrecio: string
  activo: boolean
}

export interface TiposPrecioResponse {
  data: TipoPrecio[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductoPrecio {
  idProductoPrecio: number
  idProducto: number
  idTipoPrecio: number
  idSucursal: number
  porcentajeMargen: number
  precioVenta: number
  activo: boolean
  tipoPrecio?: TipoPrecio
}

export interface CreateProductoPrecioDto {
  idProducto: number
  idTipoPrecio: number
  idSucursal: number
  porcentajeMargen: number
}
