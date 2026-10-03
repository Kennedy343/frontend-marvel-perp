import type { NavigationSection } from '../types/nav'

export const navigation: NavigationSection[] = [
  {
    label: 'Menú principal',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'icon-dashboard',
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        key: 'usuarios',
        label: 'Usuarios',
        path: '/administracion/usuarios',
        icon: 'icon-user',
        recurso: 'usuarios',
        children: [
          {
            key: 'ver-usuarios',
            label: 'Ver usuarios',
            path: '/administracion/usuarios',
            permiso: 'leer:usuarios',
          },
          {
            key: 'crear-usuario',
            label: 'Crear usuario',
            path: '/administracion/usuarios/crear',
            permiso: 'crear:usuarios',
          },
        ],
      },
      {
        key: 'roles',
        label: 'Roles',
        path: '/administracion/roles',
        icon: 'icon-settings',
        recurso: 'roles',
        children: [
          {
            key: 'ver-roles',
            label: 'Ver roles',
            path: '/administracion/roles',
            permiso: 'leer:roles',
          },
        ],
      },
    ],
  },
  {
    label: 'CRM',
    items: [
      {
        key: 'clientes',
        label: 'Clientes',
        path: '/crm/clientes',
        icon: 'icon-crm',
        recurso: 'clientes',
        children: [
          {
            key: 'ver-clientes',
            label: 'Ver clientes',
            path: '/crm/clientes',
            permiso: 'leer:clientes',
          },
          {
            key: 'crear-cliente',
            label: 'Crear cliente',
            path: '/crm/clientes/crear',
            permiso: 'crear:clientes',
          },
        ],
      },
    ],
  },
  {
    label: 'Compras',
    items: [
      {
        key: 'proveedores',
        label: 'Proveedores',
        path: '/proveedores',
        icon: 'icon-truck',
        recurso: 'proveedores',
        children: [
          {
            key: 'ver-proveedores',
            label: 'Ver proveedores',
            path: '/proveedores',
            permiso: 'leer:proveedores',
          },
          {
            key: 'crear-proveedor',
            label: 'Crear proveedor',
            path: '/proveedores/crear',
            permiso: 'crear:proveedores',
          },
        ],
      },
      {
        key: 'compras',
        label: 'Compras',
        path: '/compras',
        icon: 'icon-cart',
        recurso: 'compras',
        children: [
          {
            key: 'ver-compras',
            label: 'Ver compras',
            path: '/compras',
            permiso: 'leer:compras',
          },
          {
            key: 'crear-compra',
            label: 'Crear compra',
            path: '/compras/crear',
            permiso: 'crear:compras',
          },
        ],
      },
    ],
  },
{
    label: 'Inventario',
    items: [
      {
        key: 'kardex',
        label: 'Existencias',
        path: '/inventario/kardex',
        icon: 'icon-inventory',
        recurso: 'inventario-sucursal',
        children: [
          {
            key: 'existencias',
            label: 'Existencias',
            path: '/inventario/kardex',
            permiso: 'leer:inventario-sucursal',
          },
        ],
      },
      {
        key: 'movimientos',
        label: 'Movimientos',
        path: '/inventario/movimientos',
        icon: 'icon-arrow-down-circle',
        recurso: 'movimientos-inventario',
        children: [
          {
            key: 'ver-movimientos',
            label: 'Ver movimientos',
            path: '/inventario/movimientos',
            permiso: 'leer:movimientos-inventario',
          },
        ],
      },
      {
        key: 'traslados',
        label: 'Traslados',
        path: '/inventario/traslados',
        icon: 'icon-transfer',
        recurso: 'traslados',
        children: [
          {
            key: 'ver-traslados',
            label: 'Ver traslados',
            path: '/inventario/traslados',
            permiso: 'leer:traslados',
          },
          {
            key: 'crear-traslado',
            label: 'Crear traslado',
            path: '/inventario/traslados/crear',
            permiso: 'crear:traslados',
          },
        ],
      },
      {
        key: 'productos',
        label: 'Productos',
        path: '/inventario/productos',
        icon: 'icon-inventory',
        recurso: 'productos',
        children: [
          {
            key: 'ver-productos',
            label: 'Ver productos',
            path: '/inventario/productos',
            permiso: 'leer:productos',
          },
          {
            key: 'crear-producto',
            label: 'Crear producto',
            path: '/inventario/productos/crear',
            permiso: 'crear:productos',
          },
        ],
      },
      {
        key: 'categorias',
        label: 'Categorías',
        path: '/inventario/categorias',
        icon: 'icon-settings',
        recurso: 'categorias-producto',
        children: [
          {
            key: 'ver-categorias',
            label: 'Ver categorías',
            path: '/inventario/categorias',
            permiso: 'leer:categorias-producto',
          },
          {
            key: 'crear-categoria',
            label: 'Crear categoría',
            path: '/inventario/categorias/crear',
            permiso: 'crear:categorias-producto',
          },
        ],
      },
    ],
  },
  {
    label: 'Ventas',
    items: [
      {
        key: 'ventas',
        label: 'Ventas',
        path: '/ventas',
        icon: 'icon-crm',
        recurso: 'ventas',
        children: [
          {
            key: 'ver-ventas',
            label: 'Ver ventas',
            path: '/ventas',
            permiso: 'leer:ventas',
          },
          {
            key: 'crear-venta',
            label: 'Nueva venta',
            path: '/ventas/crear',
            permiso: 'crear:ventas',
          },
        ],
      },
    ],
  },
]
