export interface CompraProveedor {
  idProveedor: number
  nombreProveedor: string
}

export interface CompraSucursal {
  idSucursal: number
  nombreSucursal: string
}

export interface CompraProducto {
  idProducto: number
  codigoProducto: string
  nombreProducto: string
  ultimoCosto: number
}

export interface DetallePrecioMargen {
  idTipoPrecio: number
  nombreTipoPrecio: string
  porcentajeMargen: string
  precioVentaCalculado: number
}

export interface CreateDetalleCompraPayload {
  idProducto: number
  cantidad: number
  precioCostoUnitario: number
}

export interface CreateCompraPayload {
  serieFactura: string
  numeroFactura: string
  idProveedor: number
  idSucursal: number
  fechaCompra?: string
  detalles: CreateDetalleCompraPayload[]
}

export interface DetalleCompraFormData {
  idDetalleTemporal: number
  idProducto: string
  cantidad: string
  precioCostoUnitario: string
  márgenes?: DetallePrecioMargen[]
  producto?: CompraProducto
}

export type DetalleCompraPatch = Partial<
  Pick<DetalleCompraFormData, 'cantidad' | 'precioCostoUnitario' | 'márgenes'>
>

export interface CompraFormData {
  serieFactura: string
  numeroFactura: string
  idProveedor: string
  idSucursal: string
  detalles: DetalleCompraFormData[]
}

export interface DetalleCompraFormErrors {
  idProducto?: string
  cantidad?: string
  precioCostoUnitario?: string
  márgenes?: string
}

export interface CompraFormErrors {
  serieFactura?: string
  numeroFactura?: string
  idProveedor?: string
  idSucursal?: string
}

export interface CompraDetalle {
  idDetalleCompra: number
  idProducto: number
  cantidad: number
  precioCostoUnitario: number
  subtotal: number
  producto: CompraProducto
}

export interface Compra {
  idCompra: number
  serieFactura: string
  numeroFactura: string
  fechaCompra: string
  totalCompra: number
  compraActiva: boolean
  motivoAnulacion?: string | null
  proveedor: CompraProveedor
  sucursal: CompraSucursal
  detalles: CompraDetalle[]
}

export interface ComprasMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ComprasResponse {
  data: Compra[]
  meta: ComprasMeta
}

export interface ComprasQuery {
  page?: number
  limit?: number
  search?: string
  fechaInicio?: string
  fechaFinal?: string
  idProveedor?: number
  idSucursal?: number
  compraActiva?: boolean
}
