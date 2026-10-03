import type { IconName } from '../../../components/common/Icon'

export interface PermisoGrupo {
  key: string
  titulo: string
  icono: IconName
  recursos: string[]
  colapsado?: boolean
}

// Hoisted static value (Vercel Best Practice: prefer-module-scope-static-value)
export const PERMISO_GRUPOS: PermisoGrupo[] = [
  {
    key: 'administracion',
    titulo: 'Usuarios',
    icono: 'icon-user',
    colapsado: true,
    recursos: ['usuarios', 'roles', 'permisos', 'rol-permisos', 'usuario-permisos'],
  },
  {
    key: 'sucursales',
    titulo: 'Sucursales',
    icono: 'icon-map-pin',
    colapsado: true,
    recursos: ['sucursales', 'usuario-sucursales'],
  },
  {
    key: 'clientes',
    titulo: 'Clientes',
    icono: 'icon-crm',
    colapsado: true,
    recursos: [
      'clientes',
      'sectores',
      'categorias',
      'comunidades',
      'municipios',
      'departamentos',
    ],
  },
  {
    key: 'proveedores',
    titulo: 'Proveedores',
    icono: 'icon-truck',
    colapsado: true,
    recursos: ['proveedores'],
  },
  {
    key: 'productos',
    titulo: 'Productos',
    icono: 'icon-inventory',
    colapsado: true,
    recursos: [
      'productos',
      'categorias-producto',
      'producto-categorias',
      'tipos-precio',
      'producto-precios',
    ],
  },
  {
    key: 'compras',
    titulo: 'Compras',
    icono: 'icon-cart',
    colapsado: true,
    recursos: ['compras'],
  },
  {
    key: 'inventario',
    titulo: 'Inventario',
    icono: 'icon-inventory',
    colapsado: true,
    recursos: ['inventario-sucursal'],
  },
  {
    key: 'traslados-ajustes',
    titulo: 'Traslados y ajustes',
    icono: 'icon-transfer',
    colapsado: true,
    recursos: ['traslados', 'ajustes-inventario'],
  },
  {
    key: 'ventas',
    titulo: 'Ventas',
    icono: 'icon-sales',
    colapsado: true,
    recursos: ['ventas', 'detalle-ventas'],
  },
]

// Acciones realmente aplicables por recurso. El seed crea las 5 acciones para
// todos los recursos, aunque el backend solo valide un subconjunto
// (p. ej. movimientos-inventario solo usa `leer`).
// Hoisted static value (Vercel Best Practice: prefer-module-scope-static-value)
export const ACCIONES_POR_RECURSO: Record<string, readonly string[]> = {
  'movimientos-inventario': ['leer'],
  traslados: ['crear', 'leer', 'actualizar'],
  'ajustes-inventario': ['crear', 'leer', 'actualizar', 'aprobar'],
}
