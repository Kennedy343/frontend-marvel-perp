import type { Permiso, Rol } from '../modules/administracion/types/usuario'
import type {
  CategoriaCliente,
  Client,
  Comunidad,
  Departamento,
  Municipio,
  Sector,
} from '../modules/crm/types/client'
import type { Proveedor } from '../modules/proveedores/types/proveedor'
import type { CategoriaProducto } from '../modules/inventario/types/categoria'
import type { Producto } from '../modules/inventario/types/producto'
import type {
  InventarioSucursal,
  SucursalInventario,
} from '../modules/inventario/types/inventarioSucursal'
import type { MovimientoInventario } from '../modules/inventario/types/movimiento'
import type { Traslado } from '../modules/inventario/types/traslado'
import type { Compra } from '../modules/compras/types/compra'
import type { Venta } from '../modules/ventas/types/venta'
import type { ProductoPrecio, TipoPrecio } from '../modules/precios/types/precio'
import { createSeedDb } from './seed'

export interface MockUsuario {
  idUsuario: number
  nombreUsuario: string
  apellidoUsuario: string
  correoUsuario: string
  passwordUsuario: string
  usuarioActivo: boolean
  idRoles: number[]
  idSucursales: number[]
}

export interface RolPermiso {
  idRol: number
  idPermiso: number
}

export interface MockDb {
  usuarios: MockUsuario[]
  roles: Rol[]
  permisos: Permiso[]
  rolPermisos: RolPermiso[]
  sucursales: SucursalInventario[]
  departamentos: Departamento[]
  municipios: Municipio[]
  comunidades: Comunidad[]
  sectores: Sector[]
  categoriasCliente: CategoriaCliente[]
  clientes: Client[]
  proveedores: Proveedor[]
  categoriasProducto: CategoriaProducto[]
  productos: Producto[]
  tiposPrecio: TipoPrecio[]
  productoPrecios: ProductoPrecio[]
  inventarioSucursal: InventarioSucursal[]
  movimientos: MovimientoInventario[]
  traslados: Traslado[]
  compras: Compra[]
  ventas: Venta[]
}

export interface MockSession {
  token: string
  idUsuario: number
}

const DB_STORAGE_KEY = 'marvel-mock-db-v1'
const SESSION_STORAGE_KEY = 'marvel-mock-session-v1'

let cache: MockDb | null = null

export function loadDb(): MockDb {
  if (cache) return cache

  const raw = localStorage.getItem(DB_STORAGE_KEY)
  if (raw) {
    try {
      cache = JSON.parse(raw) as MockDb
    } catch {
      cache = null
    }
  }

  if (!cache) {
    cache = createSeedDb()
    saveDb()
  }

  return cache
}

export function saveDb(): void {
  if (!cache) return
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(cache))
}

export function resetDb(): MockDb {
  cache = createSeedDb()
  saveDb()
  return cache
}

export function nextId<T>(items: T[], getValue: (item: T) => number): number {
  return items.reduce((max, item) => Math.max(max, getValue(item) || 0), 0) + 1
}

export function getSession(): MockSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MockSession
  } catch {
    return null
  }
}

export function setSession(session: MockSession | null): void {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}
