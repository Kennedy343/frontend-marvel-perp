export interface UserSucursal {
  idSucursal: number
  nombreSucursal: string
}

export interface User {
  id: number | string
  nombreCompleto: string
  correoElectronico: string
  rolAsignado: string
  activo: boolean
  idSucursal?: number | string | null
  nombreSucursal?: string | null
  sucursales?: UserSucursal[]
  permisos?: string[]
}