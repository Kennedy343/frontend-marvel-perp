import type { PeriodoEstadistica } from '../../ventas/types/venta'

export interface PeriodoMeta {
  periodo: PeriodoEstadistica
  label: string
  corto: string
}

// Hoisted static value (Vercel Best Practice: prefer-module-scope-static-value)
export const PERIODOS_META: PeriodoMeta[] = [
  { periodo: 'dia', label: 'Hoy', corto: 'Día' },
  { periodo: 'semana', label: 'Semana', corto: 'Sem.' },
  { periodo: 'mes', label: 'Mes', corto: 'Mes' },
  { periodo: 'trimestre', label: 'Trimestre', corto: 'Trim.' },
  { periodo: 'anio', label: 'Año', corto: 'Año' },
]
