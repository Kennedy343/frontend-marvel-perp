export const PRICE_INPUT_REGEX = /^\d+(\.\d{1,2})?$/

export function round2(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function safeCalculatePrecio(
  costoRaw: string | number,
  margenRaw: string | number,
): number {
  const costo = Number(costoRaw)
  const margen = Number(margenRaw)
  if (Number.isNaN(costo) || costo <= 0) return 0
  if (Number.isNaN(margen)) return round2(costo)
  return round2(costo + (costo * margen) / 100)
}

export const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})
