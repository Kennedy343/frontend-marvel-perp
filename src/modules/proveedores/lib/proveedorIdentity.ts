const AVATAR_ACCENTS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

export function getProveedorAccent(idProveedor: number): string {
  return AVATAR_ACCENTS[Math.abs(idProveedor) % AVATAR_ACCENTS.length]
}

export function getInitials(nombre: string): string {
  const words = nombre.trim().split(/\s+/)
  if (words.length >= 2) {
    return ((words[0][0] || '') + (words[1][0] || '')).toUpperCase()
  }
  return nombre.trim().slice(0, 2).toUpperCase() || 'PV'
}
