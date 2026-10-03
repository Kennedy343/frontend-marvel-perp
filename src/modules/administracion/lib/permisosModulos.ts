import type { Permiso, PermisoModulo } from '../types/usuario'

// Agrupa los permisos planos (`accion:recurso`) en módulos por recurso.
// Pure function hoisted to module scope (Vercel: prefer-module-scope-pure-function).
export function agruparPermisosEnModulos(permisos: Permiso[]): PermisoModulo[] {
  const byRecurso = new Map<string, { accion: string; idPermiso: number }[]>()

  for (const permiso of permisos) {
    const idx = permiso.nombrePermiso.indexOf(':')
    if (idx === -1) continue
    const accion = permiso.nombrePermiso.slice(0, idx)
    const recurso = permiso.nombrePermiso.slice(idx + 1)
    const acciones = byRecurso.get(recurso)
    if (acciones) {
      acciones.push({ accion, idPermiso: permiso.idPermiso })
    } else {
      byRecurso.set(recurso, [{ accion, idPermiso: permiso.idPermiso }])
    }
  }

  return Array.from(byRecurso, ([recurso, acciones]) => ({ recurso, acciones }))
}
