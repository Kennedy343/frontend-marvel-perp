export interface Departamento {
  idDepartamento: number
  nombreDepartamento: string
  departamentoActivo?: boolean
}

export interface Proveedor {
  idProveedor: number
  nombreProveedor: string
  nitProveedor: string
  telefonoProveedor?: string | null
  idDepartamento: number
  departamento?: Departamento | null
}

export interface ProveedoresMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProveedoresResponse {
  data: Proveedor[]
  meta: ProveedoresMeta
}

export interface ProveedoresQuery {
  page?: number
  limit?: number
  search?: string
  idDepartamento?: number
}

export interface CreateProveedorPayload {
  nombreProveedor: string
  nitProveedor: string
  telefonoProveedor?: string
  idDepartamento: number
}

export interface UpdateProveedorPayload {
  nombreProveedor?: string
  nitProveedor?: string
  telefonoProveedor?: string
  idDepartamento?: number
}

export interface ProveedorFormData {
  nombreProveedor: string
  nitProveedor: string
  telefonoProveedor: string
  idDepartamento: string
}

export interface ProveedorFormErrors {
  nombreProveedor?: string
  nitProveedor?: string
  telefonoProveedor?: string
  idDepartamento?: string
}

export interface FeedbackMessage {
  type: 'success' | 'error'
  text: string
}

export interface ProveedorToDelete {
  id: number
  nombre: string
}
