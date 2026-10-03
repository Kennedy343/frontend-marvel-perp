import api from '../../../lib/axios'
import { proveedorService } from '../../proveedores/services/proveedorService'
import type { Sucursal } from '../../administracion/types/usuario'
import type { Proveedor } from '../../proveedores/types/proveedor'
import type {
  Compra,
  CompraProveedor,
  CompraSucursal,
  ComprasQuery,
  ComprasResponse,
  CreateCompraPayload,
} from '../types/compra'

const CATALOG_LIMIT = 1000

function normalizeCompra(raw: Compra): Compra {
  return {
    ...raw,
    totalCompra: Number(raw.totalCompra) || 0,
    detalles: (raw.detalles ?? []).map((d) => ({
      ...d,
      cantidad: Number(d.cantidad) || 0,
      precioCostoUnitario: Number(d.precioCostoUnitario) || 0,
      subtotal: Number(d.subtotal) || 0,
    })),
  }
}

export const compraService = {
  async create(payload: CreateCompraPayload): Promise<unknown> {
    const { data } = await api.post('/compras', payload)
    return data
  },

  async getAll(query: ComprasQuery = {}): Promise<ComprasResponse> {
    const { data } = await api.get<ComprasResponse>('/compras', {
      params: query,
    })
    return {
      ...data,
      data: data.data.map(normalizeCompra),
    }
  },

  async getById(id: number): Promise<Compra> {
    const { data } = await api.get<Compra>(`/compras/${id}`)
    return normalizeCompra(data)
  },

  async anular(id: number, motivoAnulacion: string): Promise<Compra> {
    const { data } = await api.patch<Compra>(`/compras/${id}/anular`, {
      motivoAnulacion,
    })
    return normalizeCompra(data)
  },

  async getProveedores(): Promise<CompraProveedor[]> {
    const response = await proveedorService.getAll({ limit: CATALOG_LIMIT })
    return response.data.map<CompraProveedor>((p: Proveedor) => ({
      idProveedor: p.idProveedor,
      nombreProveedor: p.nombreProveedor,
    }))
  },

  async getSucursales(): Promise<CompraSucursal[]> {
    const { data } = await api.get<Sucursal[] | { data?: Sucursal[] }>('/sucursales', {
      params: { limit: CATALOG_LIMIT },
    })
    const list = Array.isArray(data)
      ? data
      : data && Array.isArray(data.data)
        ? data.data
        : []
    return list.map<CompraSucursal>((s: Sucursal) => ({
      idSucursal: s.idSucursal,
      nombreSucursal: s.nombreSucursal,
    }))
  },
}