export function tieneRecurso(permisos: string[] | undefined, recurso: string | undefined): boolean {
  if (!recurso) return true
  return (permisos ?? []).some((p) => p.endsWith(`:${recurso}`))
}

export function tienePermiso(permisos: string[] | undefined, permiso: string | undefined): boolean {
  if (!permiso) return true
  return (permisos ?? []).includes(permiso)
}