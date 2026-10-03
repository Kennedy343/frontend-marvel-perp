import type { Producto } from '../types/producto'

export function getStockEnSucursal(
  producto: Producto | undefined,
  idSucursal: number | null,
): number | null {
  if (!producto || idSucursal == null) return null
  const inventario = producto.inventarios?.find(
    (inv) => inv.idSucursal === idSucursal && inv.activo,
  )
  return inventario ? inventario.stockActual : 0
}
