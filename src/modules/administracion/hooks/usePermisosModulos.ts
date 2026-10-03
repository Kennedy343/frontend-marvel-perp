import { useEffect, useState } from 'react'
import { usuarioService } from '../services/usuarioService'
import { agruparPermisosEnModulos } from '../lib/permisosModulos'
import type { PermisoModulo } from '../types/usuario'

// Carga el catálogo de permisos y lo agrupa por recurso (módulos).
export function usePermisosModulos() {
  const [modulos, setModulos] = useState<PermisoModulo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    usuarioService
      .getPermisos()
      .then((permisos) => {
        if (active) setModulos(agruparPermisosEnModulos(permisos))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { modulos, isLoading }
}
