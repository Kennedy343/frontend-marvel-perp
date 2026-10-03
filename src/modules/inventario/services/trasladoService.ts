import api from '../../../lib/axios'
import type {
  CreateTrasladoPayload,
  Traslado,
  TrasladosQuery,
  TrasladosResponse,
} from '../types/traslado'

export const trasladoService = {
  async getAll(
    query: TrasladosQuery = {},
    signal?: AbortSignal,
  ): Promise<TrasladosResponse> {
    const { data } = await api.get<TrasladosResponse>('/traslados', {
      params: query,
      signal,
    })
    return data
  },

  async getById(id: number, signal?: AbortSignal): Promise<Traslado> {
    const { data } = await api.get<Traslado>(`/traslados/${id}`, { signal })
    return data
  },

  async create(payload: CreateTrasladoPayload): Promise<Traslado> {
    const { data } = await api.post<Traslado>('/traslados', payload)
    return data
  },

  async enviar(id: number): Promise<Traslado> {
    const { data } = await api.post<Traslado>(`/traslados/${id}/enviar`)
    return data
  },

  async recibir(id: number): Promise<Traslado> {
    const { data } = await api.post<Traslado>(`/traslados/${id}/recibir`)
    return data
  },

  async anular(id: number, motivo?: string): Promise<Traslado> {
    const { data } = await api.post<Traslado>(`/traslados/${id}/anular`, {
      ...(motivo ? { motivo } : {}),
    })
    return data
  },
}
