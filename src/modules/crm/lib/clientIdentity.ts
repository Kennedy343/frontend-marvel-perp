export interface ClientAccent {
  avatar: string
  chip: string
  bar: string
}

const ACCENTS: ClientAccent[] = [
  { avatar: 'bg-blue-100 text-blue-700', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  { avatar: 'bg-emerald-100 text-emerald-700', chip: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  { avatar: 'bg-violet-100 text-violet-700', chip: 'bg-violet-50 text-violet-700', bar: 'bg-violet-500' },
  { avatar: 'bg-amber-100 text-amber-700', chip: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  { avatar: 'bg-rose-100 text-rose-700', chip: 'bg-rose-50 text-rose-700', bar: 'bg-rose-500' },
]

export function getClientAccent(idCliente: number): ClientAccent {
  return ACCENTS[Math.abs(idCliente) % ACCENTS.length]
}

export function getInitials(primerNombre: string, primerApellido: string): string {
  const first = primerNombre.trim().charAt(0)
  const last = primerApellido.trim().charAt(0)
  return (first + last).toUpperCase() || 'C'
}

export function getFullName(primerNombre: string, primerApellido: string): string {
  return `${primerNombre} ${primerApellido}`.trim()
}
