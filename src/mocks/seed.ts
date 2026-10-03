import type { MockDb, MockUsuario, RolPermiso } from './db'
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
import type {
  MovimientoInventario,
  MovimientoUsuario,
  OrigenMovimiento,
} from '../modules/inventario/types/movimiento'
import type { Traslado } from '../modules/inventario/types/traslado'
import type { Compra, CompraDetalle } from '../modules/compras/types/compra'
import type { DetalleVenta, Venta } from '../modules/ventas/types/venta'
import type { ProductoPrecio, TipoPrecio } from '../modules/precios/types/precio'

const PERMISO_RECURSOS = [
  'usuarios',
  'roles',
  'permisos',
  'rol-permisos',
  'usuario-permisos',
  'sucursales',
  'usuario-sucursales',
  'clientes',
  'sectores',
  'categorias',
  'comunidades',
  'municipios',
  'departamentos',
  'proveedores',
  'productos',
  'categorias-producto',
  'producto-categorias',
  'tipos-precio',
  'producto-precios',
  'compras',
  'inventario-sucursal',
  'movimientos-inventario',
  'traslados',
  'ajustes-inventario',
  'ventas',
  'detalle-ventas',
] as const

const PERMISO_ACCIONES = ['crear', 'leer', 'actualizar', 'eliminar', 'aprobar'] as const

const RECURSOS_VENDEDOR = [
  'clientes',
  'sectores',
  'categorias',
  'comunidades',
  'municipios',
  'departamentos',
  'productos',
  'categorias-producto',
  'tipos-precio',
  'producto-precios',
  'inventario-sucursal',
  'movimientos-inventario',
  'ventas',
  'detalle-ventas',
]

const RECURSOS_BODEGUERO = [
  'productos',
  'categorias-producto',
  'inventario-sucursal',
  'movimientos-inventario',
  'traslados',
  'ajustes-inventario',
  'compras',
]

const ACCIONES_OPERATIVAS = ['crear', 'leer', 'actualizar']

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function isoDaysAgo(days: number, hour = 10): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function buildPermisos() {
  const permisos: Permiso[] = []
  const porRecurso = new Map<string, Permiso[]>()
  let idPermiso = 1

  for (const recurso of PERMISO_RECURSOS) {
    const lista: Permiso[] = []
    for (const accion of PERMISO_ACCIONES) {
      const permiso: Permiso = { idPermiso, nombrePermiso: `${accion}:${recurso}` }
      idPermiso += 1
      permisos.push(permiso)
      lista.push(permiso)
    }
    porRecurso.set(recurso, lista)
  }

  return { permisos, porRecurso }
}

function buildRolPermisos(
  porRecurso: Map<string, Permiso[]>,
  idRol: number,
  recursos: readonly string[],
  acciones: readonly string[],
): RolPermiso[] {
  const resultado: RolPermiso[] = []

  for (const recurso of recursos) {
    for (const permiso of porRecurso.get(recurso) ?? []) {
      const accion = permiso.nombrePermiso.slice(0, permiso.nombrePermiso.indexOf(':'))
      if (acciones.includes(accion)) {
        resultado.push({ idRol, idPermiso: permiso.idPermiso })
      }
    }
  }

  return resultado
}

function buildProducto(
  idProducto: number,
  codigoProducto: string,
  nombreProducto: string,
  descripcion: string,
  ultimoCosto: number,
  categorias: CategoriaProducto[],
): Producto {
  return {
    idProducto,
    codigoProducto,
    nombreProducto,
    descripcion,
    ultimoCosto,
    activo: true,
    productoCategoria: categorias.map((categoria) => ({
      idProducto,
      idCategoria: categoria.idCategoria,
      categoriaProducto: {
        idCategoria: categoria.idCategoria,
        nombreCategoria: categoria.nombreCategoria,
      },
    })),
  }
}

function buildVentaDetalle(
  idDetalleVenta: number,
  idVenta: number,
  producto: Producto,
  idTipoPrecio: number,
  cantidad: number,
  precioVenta: number,
  tipoPrecio: TipoPrecio,
): DetalleVenta {
  return {
    idDetalleVenta,
    idVenta,
    idProducto: producto.idProducto,
    idTipoPrecio,
    cantidad,
    precioVenta,
    subtotal: round2(precioVenta * cantidad),
    producto,
    tipoPrecio,
  }
}

export function createSeedDb(): MockDb {
  const departamentos: Departamento[] = [
    { idDepartamento: 1, nombreDepartamento: 'Guatemala', departamentoActivo: true },
    { idDepartamento: 2, nombreDepartamento: 'Sacatepéquez', departamentoActivo: true },
    { idDepartamento: 3, nombreDepartamento: 'Quetzaltenango', departamentoActivo: true },
  ]

  const municipios: Municipio[] = [
    { idMunicipio: 1, nombreMunicipio: 'Guatemala', idDepartamento: 1, municipioActivo: true },
    { idMunicipio: 2, nombreMunicipio: 'Mixco', idDepartamento: 1, municipioActivo: true },
    { idMunicipio: 3, nombreMunicipio: 'Villa Nueva', idDepartamento: 1, municipioActivo: true },
    { idMunicipio: 4, nombreMunicipio: 'Antigua Guatemala', idDepartamento: 2, municipioActivo: true },
    { idMunicipio: 5, nombreMunicipio: 'Quetzaltenango', idDepartamento: 3, municipioActivo: true },
  ]

  const comunidades: Comunidad[] = [
    { idComunidad: 1, nombreComunidad: 'Zona 1', idMunicipio: 1 },
    { idComunidad: 2, nombreComunidad: 'Zona 6', idMunicipio: 1 },
    { idComunidad: 3, nombreComunidad: 'Colonia El Milagro', idMunicipio: 2 },
    { idComunidad: 4, nombreComunidad: 'Barrio El Calvario', idMunicipio: 4 },
    { idComunidad: 5, nombreComunidad: 'Zona 3', idMunicipio: 5 },
  ]

  const sectores: Sector[] = [
    { idSector: 1, nombreSector: 'Centro' },
    { idSector: 2, nombreSector: 'Norte' },
    { idSector: 3, nombreSector: 'Sur' },
    { idSector: 4, nombreSector: 'Occidente' },
  ]

  const categoriasCliente: CategoriaCliente[] = [
    { idCategoria: 1, nombreCategoria: 'Consumidor final' },
    { idCategoria: 2, nombreCategoria: 'Mayorista' },
    { idCategoria: 3, nombreCategoria: 'Empresa' },
  ]

  const sucursales: SucursalInventario[] = [
    {
      idSucursal: 1,
      codigoSucursal: 'SUC-01',
      nitSucursal: '1234567-8',
      nombreSucursal: 'Sucursal Central',
      sucursalActiva: true,
      idDepartamento: 1,
    },
    {
      idSucursal: 2,
      codigoSucursal: 'SUC-02',
      nitSucursal: '2345678-9',
      nombreSucursal: 'Sucursal Norte',
      sucursalActiva: true,
      idDepartamento: 1,
    },
    {
      idSucursal: 3,
      codigoSucursal: 'SUC-03',
      nitSucursal: '3456789-0',
      nombreSucursal: 'Sucursal Occidente',
      sucursalActiva: true,
      idDepartamento: 3,
    },
  ]

  const { permisos, porRecurso } = buildPermisos()

  const roles: Rol[] = [
    { idRol: 1, nombreRol: 'Administrador' },
    { idRol: 2, nombreRol: 'Vendedor' },
    { idRol: 3, nombreRol: 'Bodeguero' },
  ]

  const rolPermisos: RolPermiso[] = [
    ...permisos.map((permiso) => ({ idRol: 1, idPermiso: permiso.idPermiso })),
    ...buildRolPermisos(porRecurso, 2, RECURSOS_VENDEDOR, ACCIONES_OPERATIVAS),
    ...buildRolPermisos(porRecurso, 3, RECURSOS_BODEGUERO, [...ACCIONES_OPERATIVAS, 'aprobar']),
  ]

  const usuarios: MockUsuario[] = [
    {
      idUsuario: 1,
      nombreUsuario: 'Ana',
      apellidoUsuario: 'Morales',
      correoUsuario: 'admin@marvel.com',
      passwordUsuario: 'admin123',
      usuarioActivo: true,
      idRoles: [1],
      idSucursales: [1, 2, 3],
    },
    {
      idUsuario: 2,
      nombreUsuario: 'Luis',
      apellidoUsuario: 'Pérez',
      correoUsuario: 'vendedor@marvel.com',
      passwordUsuario: 'vendedor123',
      usuarioActivo: true,
      idRoles: [2],
      idSucursales: [1],
    },
    {
      idUsuario: 3,
      nombreUsuario: 'Marta',
      apellidoUsuario: 'López',
      correoUsuario: 'bodega@marvel.com',
      passwordUsuario: 'bodega123',
      usuarioActivo: true,
      idRoles: [3],
      idSucursales: [1, 2],
    },
  ]

  const proveedores: Proveedor[] = [
    {
      idProveedor: 1,
      nombreProveedor: 'Distribuidora La Ceiba',
      nitProveedor: '8765432-1',
      telefonoProveedor: '2222-1111',
      idDepartamento: 1,
      departamento: departamentos[0],
    },
    {
      idProveedor: 2,
      nombreProveedor: 'Importadora Xela',
      nitProveedor: '7654321-0',
      telefonoProveedor: '7777-2222',
      idDepartamento: 3,
      departamento: departamentos[2],
    },
    {
      idProveedor: 3,
      nombreProveedor: 'Suministros Antigua',
      nitProveedor: '6543210-9',
      telefonoProveedor: '7832-3333',
      idDepartamento: 2,
      departamento: departamentos[1],
    },
  ]

  const clientes: Client[] = [
    {
      idCliente: 1,
      primerNombre: 'Carlos',
      segundoNombre: 'Enrique',
      primerApellido: 'Gómez',
      segundoApellido: 'Rivas',
      telefono: '5555-0001',
      dpiCliente: '1234567890101',
      nit: '1234567-8',
      comunidad: { idComunidad: 1, nombreComunidad: comunidades[0].nombreComunidad },
      categoria: { idCategoria: 1, nombreCategoria: categoriasCliente[0].nombreCategoria },
      sucursal: { idSucursal: 1, nombreSucursal: sucursales[0].nombreSucursal },
      sector: { idSector: 1, nombreSector: sectores[0].nombreSector },
    },
    {
      idCliente: 2,
      primerNombre: 'María',
      segundoNombre: null,
      primerApellido: 'Fernández',
      segundoApellido: 'Lux',
      telefono: '5555-0002',
      dpiCliente: '1234567890102',
      nit: 'CF',
      comunidad: { idComunidad: 2, nombreComunidad: comunidades[1].nombreComunidad },
      categoria: { idCategoria: 2, nombreCategoria: categoriasCliente[1].nombreCategoria },
      sucursal: { idSucursal: 1, nombreSucursal: sucursales[0].nombreSucursal },
      sector: { idSector: 2, nombreSector: sectores[1].nombreSector },
    },
    {
      idCliente: 3,
      primerNombre: 'Jorge',
      segundoNombre: null,
      primerApellido: 'Castillo',
      segundoApellido: null,
      telefono: '5555-0003',
      dpiCliente: '1234567890103',
      nit: 'CF',
      comunidad: { idComunidad: 3, nombreComunidad: comunidades[2].nombreComunidad },
      categoria: { idCategoria: 3, nombreCategoria: categoriasCliente[2].nombreCategoria },
      sucursal: { idSucursal: 2, nombreSucursal: sucursales[1].nombreSucursal },
      sector: { idSector: 3, nombreSector: sectores[2].nombreSector },
    },
    {
      idCliente: 4,
      primerNombre: 'Ana',
      segundoNombre: 'Lucía',
      primerApellido: 'Ramírez',
      segundoApellido: 'Solís',
      telefono: '5555-0004',
      dpiCliente: '1234567890104',
      nit: 'CF',
      comunidad: { idComunidad: 4, nombreComunidad: comunidades[3].nombreComunidad },
      categoria: { idCategoria: 1, nombreCategoria: categoriasCliente[0].nombreCategoria },
      sucursal: { idSucursal: 3, nombreSucursal: sucursales[2].nombreSucursal },
      sector: { idSector: 4, nombreSector: sectores[3].nombreSector },
    },
  ]

  const categoriasProducto: CategoriaProducto[] = [
    { idCategoria: 1, nombreCategoria: 'Bebidas', activo: true },
    { idCategoria: 2, nombreCategoria: 'Abarrotes', activo: true },
    { idCategoria: 3, nombreCategoria: 'Limpieza', activo: true },
    { idCategoria: 4, nombreCategoria: 'Lácteos', activo: true },
  ]

  const productos: Producto[] = [
    buildProducto(1, 'REF-001', 'Gaseosa 600ml', 'Botella de gaseosa de 600ml', 4.5, [categoriasProducto[0]]),
    buildProducto(2, 'ARR-001', 'Arroz 5 libras', 'Bolsa de arroz de 5 libras', 18, [categoriasProducto[1]]),
    buildProducto(3, 'LIM-001', 'Jabón de baño', 'Jabón de baño 150g', 6.25, [categoriasProducto[2]]),
    buildProducto(4, 'LAC-001', 'Leche entera 1L', 'Caja de leche entera 1 litro', 8.75, [categoriasProducto[3]]),
    buildProducto(5, 'REF-002', 'Agua pura 600ml', 'Botella de agua pura 600ml', 2.5, [categoriasProducto[0]]),
    buildProducto(6, 'ABA-001', 'Frijol negro 1lb', 'Bolsa de frijol negro de 1 libra', 5, [categoriasProducto[1]]),
  ]

  const tiposPrecio: TipoPrecio[] = [
    { idTipoPrecio: 1, nombreTipoPrecio: 'Minorista', activo: true },
    { idTipoPrecio: 2, nombreTipoPrecio: 'Mayorista', activo: true },
    { idTipoPrecio: 3, nombreTipoPrecio: 'Especial', activo: true },
  ]

  const margenesPorTipo: Record<number, number> = { 1: 30, 2: 15, 3: 45 }

  const productoPrecios: ProductoPrecio[] = []
  let idProductoPrecio = 1
  for (const producto of productos) {
    for (const tipo of tiposPrecio) {
      for (const sucursal of sucursales) {
        const margen = margenesPorTipo[tipo.idTipoPrecio] ?? 30
        productoPrecios.push({
          idProductoPrecio,
          idProducto: producto.idProducto,
          idTipoPrecio: tipo.idTipoPrecio,
          idSucursal: sucursal.idSucursal,
          porcentajeMargen: margen,
          precioVenta: round2(producto.ultimoCosto * (1 + margen / 100)),
          activo: true,
          tipoPrecio: tipo,
        })
        idProductoPrecio += 1
      }
    }
  }

  const stockInicial: Record<number, number[]> = {
    1: [120, 40, 60],
    2: [80, 35, 25],
    3: [150, 90, 70],
    4: [60, 20, 15],
    5: [200, 120, 100],
    6: [90, 50, 30],
  }

  const inventarioSucursal: InventarioSucursal[] = []
  const movimientos: MovimientoInventario[] = []
  const usuarioSeed: MovimientoUsuario = {
    idUsuario: 1,
    nombreUsuario: 'Ana',
    apellidoUsuario: 'Morales',
    correoUsuario: 'admin@marvel.com',
  }
  let idInventario = 1
  let idMovimiento = 1

  for (const producto of productos) {
    const stocks = stockInicial[producto.idProducto] ?? [10, 10, 10]
    sucursales.forEach((sucursal, index) => {
      const stock = stocks[index] ?? 10
      inventarioSucursal.push({
        idInventario,
        idProducto: producto.idProducto,
        idSucursal: sucursal.idSucursal,
        stockActual: stock,
        stockMinimo: 10,
        activo: true,
        producto,
        sucursal,
      })
      movimientos.push({
        idMovimiento,
        idProducto: producto.idProducto,
        idSucursal: sucursal.idSucursal,
        tipo: 'ENTRADA',
        origen: 'INICIAL',
        cantidad: stock,
        saldoAnterior: 0,
        saldoNuevo: stock,
        idReferencia: null,
        idTraslado: null,
        idUsuario: 1,
        fecha: isoDaysAgo(120, 8),
        observacion: 'Carga inicial de inventario',
        producto,
        sucursal,
        usuario: usuarioSeed,
      })
      idInventario += 1
      idMovimiento += 1
    })
  }

  const compras: Compra[] = []
  const compraUnoDetalles: CompraDetalle[] = [
    {
      idDetalleCompra: 1,
      idProducto: productos[0].idProducto,
      cantidad: 48,
      precioCostoUnitario: productos[0].ultimoCosto,
      subtotal: round2(productos[0].ultimoCosto * 48),
      producto: {
        idProducto: productos[0].idProducto,
        codigoProducto: productos[0].codigoProducto,
        nombreProducto: productos[0].nombreProducto,
        ultimoCosto: productos[0].ultimoCosto,
      },
    },
    {
      idDetalleCompra: 2,
      idProducto: productos[4].idProducto,
      cantidad: 72,
      precioCostoUnitario: productos[4].ultimoCosto,
      subtotal: round2(productos[4].ultimoCosto * 72),
      producto: {
        idProducto: productos[4].idProducto,
        codigoProducto: productos[4].codigoProducto,
        nombreProducto: productos[4].nombreProducto,
        ultimoCosto: productos[4].ultimoCosto,
      },
    },
  ]
  compras.push({
    idCompra: 1,
    serieFactura: 'A',
    numeroFactura: '1001',
    fechaCompra: isoDaysAgo(30, 9),
    totalCompra: round2(compraUnoDetalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)),
    compraActiva: true,
    motivoAnulacion: null,
    proveedor: { idProveedor: 1, nombreProveedor: proveedores[0].nombreProveedor },
    sucursal: { idSucursal: 1, nombreSucursal: sucursales[0].nombreSucursal },
    detalles: compraUnoDetalles,
  })

  const compraDosDetalles: CompraDetalle[] = [
    {
      idDetalleCompra: 3,
      idProducto: productos[1].idProducto,
      cantidad: 30,
      precioCostoUnitario: productos[1].ultimoCosto,
      subtotal: round2(productos[1].ultimoCosto * 30),
      producto: {
        idProducto: productos[1].idProducto,
        codigoProducto: productos[1].codigoProducto,
        nombreProducto: productos[1].nombreProducto,
        ultimoCosto: productos[1].ultimoCosto,
      },
    },
  ]
  compras.push({
    idCompra: 2,
    serieFactura: 'B',
    numeroFactura: '2002',
    fechaCompra: isoDaysAgo(10, 11),
    totalCompra: round2(compraDosDetalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)),
    compraActiva: true,
    motivoAnulacion: null,
    proveedor: { idProveedor: 2, nombreProveedor: proveedores[1].nombreProveedor },
    sucursal: { idSucursal: 2, nombreSucursal: sucursales[1].nombreSucursal },
    detalles: compraDosDetalles,
  })

  const tipoMinorista = tiposPrecio[0]
  const ventas: Venta[] = []
  const diasVenta = [0, 1, 3, 6, 9, 15, 22, 45, 80, 140, 220, 320]
  let idDetalleVenta = 1

  diasVenta.forEach((dias, index) => {
    const cliente = clientes[index % clientes.length]
    const sucursal = sucursales[index % sucursales.length]
    const ventaId = index + 1
    const producto = productos[index % productos.length]

    const precioVenta = productoPrecios.find(
      (precio) =>
        precio.idProducto === producto.idProducto &&
        precio.idTipoPrecio === tipoMinorista.idTipoPrecio &&
        precio.idSucursal === sucursal.idSucursal,
    )?.precioVenta ?? round2(producto.ultimoCosto * 1.3)

    const cantidad = (index % 3) + 1
    const detalle = buildVentaDetalle(
      idDetalleVenta,
      ventaId,
      producto,
      tipoMinorista.idTipoPrecio,
      cantidad,
      precioVenta,
      tipoMinorista,
    )
    idDetalleVenta += 1

    ventas.push({
      idVenta: ventaId,
      serieFactura: null,
      numeroFactura: null,
      uuidDte: null,
      idCliente: cliente.idCliente,
      idSucursal: sucursal.idSucursal,
      idUsuario: 2,
      totalVenta: detalle.subtotal,
      fechaVenta: isoDaysAgo(dias, 12),
      fechaFacturacion: null,
      facturada: false,
      ventaActiva: true,
      fechaAnulacion: null,
      motivoAnulacion: null,
      idUsuarioAnulo: null,
      cliente: {
        idCliente: cliente.idCliente,
        dpiCliente: cliente.dpiCliente,
        nit: cliente.nit ?? null,
        primerNombre: cliente.primerNombre,
        segundoNombre: cliente.segundoNombre ?? null,
        primerApellido: cliente.primerApellido,
        segundoApellido: cliente.segundoApellido ?? null,
        telefono: cliente.telefono ?? '',
      },
      sucursal: {
        idSucursal: sucursal.idSucursal,
        codigoSucursal: sucursal.codigoSucursal,
        nitSucursal: sucursal.nitSucursal,
        nombreSucursal: sucursal.nombreSucursal,
      },
      usuario: {
        idUsuario: 2,
        nombreUsuario: 'Luis',
        apellidoUsuario: 'Pérez',
        correoUsuario: 'vendedor@marvel.com',
      },
      usuarioAnulo: null,
      detalles: [detalle],
    })
  })

  const origenMovimiento = (venta: Venta, producto: Producto, cantidad: number) => {
    const inventario = inventarioSucursal.find(
      (item) => item.idProducto === producto.idProducto && item.idSucursal === venta.idSucursal,
    )
    const saldoNuevo = inventario?.stockActual ?? 0
    return {
      idMovimiento,
      idProducto: producto.idProducto,
      idSucursal: venta.idSucursal,
      tipo: 'SALIDA' as const,
      origen: 'VENTA' as OrigenMovimiento,
      cantidad,
      saldoAnterior: saldoNuevo + cantidad,
      saldoNuevo,
      idReferencia: venta.idVenta,
      idTraslado: null,
      idUsuario: venta.idUsuario,
      fecha: venta.fechaVenta,
      observacion: null,
      producto,
      sucursal: sucursales.find((sucursal) => sucursal.idSucursal === venta.idSucursal) ?? sucursales[0],
      usuario: {
        idUsuario: 2,
        nombreUsuario: 'Luis',
        apellidoUsuario: 'Pérez',
        correoUsuario: 'vendedor@marvel.com',
      },
    }
  }

  for (const venta of ventas) {
    const detalle = venta.detalles?.[0]
    if (!detalle) continue
    const producto = productos.find((item) => item.idProducto === detalle.idProducto)
    if (!producto) continue
    movimientos.push(origenMovimiento(venta, producto, detalle.cantidad))
    idMovimiento += 1
  }

  const traslados: Traslado[] = [
    {
      idTraslado: 1,
      idSucursalOrigen: 1,
      idSucursalDestino: 2,
      estado: 'RECIBIDO',
      motivo: 'Reabastecimiento de sucursal',
      fechaCreacion: isoDaysAgo(8, 8),
      fechaEnvio: isoDaysAgo(7, 9),
      fechaRecepcion: isoDaysAgo(6, 10),
      idUsuarioSolicita: 3,
      idUsuarioEnvio: 3,
      idUsuarioRecibe: 3,
      idUsuarioAnulo: null,
      sucursalOrigen: sucursales[0],
      sucursalDestino: sucursales[1],
      usuarioSolicita: {
        idUsuario: 3,
        nombreUsuario: 'Marta',
        apellidoUsuario: 'López',
        correoUsuario: 'bodega@marvel.com',
      },
      usuarioEnvio: {
        idUsuario: 3,
        nombreUsuario: 'Marta',
        apellidoUsuario: 'López',
        correoUsuario: 'bodega@marvel.com',
      },
      usuarioRecibe: {
        idUsuario: 3,
        nombreUsuario: 'Marta',
        apellidoUsuario: 'López',
        correoUsuario: 'bodega@marvel.com',
      },
      usuarioAnulo: null,
      detalles: [
        {
          idDetalleTraslado: 1,
          idTraslado: 1,
          idProducto: productos[0].idProducto,
          cantidad: 20,
          producto: productos[0],
        },
      ],
    },
    {
      idTraslado: 2,
      idSucursalOrigen: 1,
      idSucursalDestino: 3,
      estado: 'PENDIENTE',
      motivo: 'Traslado programado',
      fechaCreacion: isoDaysAgo(1, 15),
      fechaEnvio: null,
      fechaRecepcion: null,
      idUsuarioSolicita: 3,
      idUsuarioEnvio: null,
      idUsuarioRecibe: null,
      idUsuarioAnulo: null,
      sucursalOrigen: sucursales[0],
      sucursalDestino: sucursales[2],
      usuarioSolicita: {
        idUsuario: 3,
        nombreUsuario: 'Marta',
        apellidoUsuario: 'López',
        correoUsuario: 'bodega@marvel.com',
      },
      usuarioEnvio: null,
      usuarioRecibe: null,
      usuarioAnulo: null,
      detalles: [
        {
          idDetalleTraslado: 2,
          idTraslado: 2,
          idProducto: productos[4].idProducto,
          cantidad: 15,
          producto: productos[4],
        },
      ],
    },
  ]

  return {
    usuarios,
    roles,
    permisos,
    rolPermisos,
    sucursales,
    departamentos,
    municipios,
    comunidades,
    sectores,
    categoriasCliente,
    clientes,
    proveedores,
    categoriasProducto,
    productos,
    tiposPrecio,
    productoPrecios,
    inventarioSucursal,
    movimientos,
    traslados,
    compras,
    ventas,
  }
}
