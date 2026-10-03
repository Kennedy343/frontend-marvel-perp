import type { OrigenMovimiento, TipoMovimiento } from '../types/movimiento'
import type { EstadoTraslado } from '../types/traslado'

export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimiento, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
}

export const ORIGEN_MOVIMIENTO_LABELS: Record<OrigenMovimiento, string> = {
  COMPRA: 'Compra',
  VENTA: 'Venta',
  TRASLADO: 'Traslado',
  AJUSTE: 'Ajuste',
  INICIAL: 'Inicial',
  ANULACION_COMPRA: 'Anulación compra',
  ANULACION_VENTA: 'Anulación venta',
}

export const TIPO_MOVIMIENTO_OPTIONS: { value: TipoMovimiento; label: string }[] = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
]

export const ORIGEN_MOVIMIENTO_OPTIONS: {
  value: OrigenMovimiento
  label: string
}[] = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'VENTA', label: 'Venta' },
  { value: 'TRASLADO', label: 'Traslado' },
  { value: 'AJUSTE', label: 'Ajuste' },
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'ANULACION_COMPRA', label: 'Anulación compra' },
  { value: 'ANULACION_VENTA', label: 'Anulación venta' },
]

export const ESTADO_TRASLADO_LABELS: Record<EstadoTraslado, string> = {
  PENDIENTE: 'Pendiente',
  ENVIADO: 'Enviado',
  RECIBIDO: 'Recibido',
  ANULADO: 'Anulado',
}

export const ESTADO_TRASLADO_OPTIONS: { value: EstadoTraslado; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'RECIBIDO', label: 'Recibido' },
  { value: 'ANULADO', label: 'Anulado' },
]
