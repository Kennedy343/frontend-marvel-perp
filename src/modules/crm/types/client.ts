export interface ClientRelation {
  id?: number
  idComunidad?: number
  idCategoria?: number
  idSucursal?: number
  idSector?: number
  nombreComunidad?: string
  nombreCategoria?: string
  nombreSucursal?: string
  nombreSector?: string
}

export interface Client {
  idCliente: number
  primerNombre: string
  segundoNombre?: string | null
  primerApellido: string
  segundoApellido?: string | null
  telefono?: string | null
  dpiCliente: string
  nit?: string | null
  comunidad?: ClientRelation | null
  categoria?: ClientRelation | null
  sucursal?: ClientRelation | null
  sector?: ClientRelation | null
}

export interface ClientsMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ClientsResponse {
  data: Client[]
  meta: ClientsMeta
}

export interface ClientsQuery {
  page?: number
  limit?: number
  search?: string
  idSucursal?: number
}

export interface CreateClientPayload {
  dpiCliente: string
  nit?: string
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
  telefono?: string
  idSector?: number | string
  idComunidad: number | string
  idCategoria: number | string
  idSucursal?: number | string
}

export type UpdateClientPayload = Partial<CreateClientPayload>


export interface Sector {
  idSector: number
  nombreSector: string
}

export interface Comunidad {
  idComunidad: number
  nombreComunidad: string
  idMunicipio: number
  municipio?: { idMunicipio: number; nombreMunicipio: string } | null
}

export interface Departamento {
  idDepartamento: number
  nombreDepartamento: string
  departamentoActivo?: boolean
  municipio?: Municipio[]
}

export interface Municipio {
  idMunicipio: number
  nombreMunicipio: string
  idDepartamento: number
  departamento?: Departamento | null
  municipioActivo?: boolean
}

export interface CategoriaCliente {
  idCategoria: number
  nombreCategoria: string
}

export interface SucursalOption {
  idSucursal: number
  nombreSucursal: string
  codigoSucursal?: string
  sucursalActiva?: boolean
}

export interface ClientFormData {
  dpiCliente: string
  nit: string
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
  telefono: string
  idDepartamento: string
  idMunicipio: string
  idSector: string
  idComunidad: string
  idCategoria: string
}

export interface ClientFormErrors {
  dpiCliente?: string
  nit?: string
  primerNombre?: string
  segundoNombre?: string
  primerApellido?: string
  segundoApellido?: string
  telefono?: string
  idDepartamento?: string
  idMunicipio?: string
  idSector?: string
  idComunidad?: string
  idCategoria?: string
}
