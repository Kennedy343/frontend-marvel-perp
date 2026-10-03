export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getNowISO(): string {
  return new Date().toISOString()
}

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const fechaFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const horaFormatter = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function formatFechaCompra(value: string): string {
  const match = DATE_ONLY_RE.exec(value)
  if (!match) return value
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? value : fechaFormatter.format(date)
}

export function formatFecha(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : fechaFormatter.format(date)
}

export function formatHora(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : horaFormatter.format(date)
}
