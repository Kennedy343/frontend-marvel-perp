import api from '../../../lib/axios'
import type {
  MovimientoInventario,
  MovimientosQuery,
  MovimientosResponse,
} from '../types/movimiento'

export const movimientoService = {
  async getAll(
    query: MovimientosQuery = {},
    signal?: AbortSignal,
  ): Promise<MovimientosResponse> {
    const { data } = await api.get<MovimientosResponse>('/inventario/movimientos', {
      params: query,
      signal,
    })
    return data
  },

  async getKardex(
    idProducto: number,
    idSucursal?: number,
    signal?: AbortSignal,
  ): Promise<MovimientoInventario[]> {
    const { data } = await api.get<MovimientoInventario[]>(
      `/inventario/movimientos/kardex/${idProducto}`,
      {
        params: idSucursal !== undefined ? { idSucursal } : undefined,
        signal,
      },
    )
    return data
  },
}
