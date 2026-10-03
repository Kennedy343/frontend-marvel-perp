// Hoisted formatters to module scope (Vercel Best Practice: prefer-module-scope-static-value)
const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('es-GT')

export function formatCurrency(value: number): string {
  return moneyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
