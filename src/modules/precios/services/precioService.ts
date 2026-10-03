import api from '../../../lib/axios'
import type {
  CreateProductoPrecioDto,
  ProductoPrecio,
  TipoPrecio,
  TiposPrecioResponse,
} from '../types/precio'

export const precioService = {
  async getTiposPrecio(): Promise<TipoPrecio[]> {
    const { data } = await api.get<TiposPrecioResponse | TipoPrecio[]>('/tipos-precio', {
      params: { limit: 100 },
    })
    if (Array.isArray(data)) {
      return data.filter((t) => t.activo)
    }
    if (data && Array.isArray(data.data)) {
      return data.data.filter((t) => t.activo)
    }
    return []
  },

  async getPreciosByProducto(idProducto: number, idSucursal?: number): Promise<ProductoPrecio[]> {
    const { data } = await api.get<{ data: ProductoPrecio[] } | ProductoPrecio[]>('/producto-precios', {
      params: {
        idProducto,
        ...(idSucursal !== undefined ? { idSucursal } : {}),
        limit: 100,
      },
    })
    if (Array.isArray(data)) {
      return data
    }
    if (data && Array.isArray(data.data)) {
      return data.data
    }
    return []
  },

  async createOrUpdatePrecio(payload: CreateProductoPrecioDto): Promise<ProductoPrecio> {
    const existing = await this.getPreciosByProducto(payload.idProducto, payload.idSucursal)
    const match = existing.find(
      (p) => p.idTipoPrecio === payload.idTipoPrecio && p.idSucursal === payload.idSucursal && p.activo
    )

    if (match) {
      const { data } = await api.patch<ProductoPrecio>(`/producto-precios/${match.idProductoPrecio}`, {
        porcentajeMargen: payload.porcentajeMargen,
      })
      return data
    }

    const { data } = await api.post<ProductoPrecio>('/producto-precios', payload)
    return data
  },

  async savePreciosBatch(precios: CreateProductoPrecioDto[]): Promise<void> {
    await Promise.all(
      precios.map((p) => this.createOrUpdatePrecio(p))
    )
  },
}
