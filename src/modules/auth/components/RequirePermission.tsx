import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { tienePermiso, tieneRecurso } from '../../../lib/permisos'

interface RequirePermissionProps {
  recurso?: string
  permiso?: string
  children: ReactNode
}

function RequirePermission({ recurso, permiso, children }: RequirePermissionProps) {
  const user = useAuthStore((state) => state.user)

  const allowed = tienePermiso(user?.permisos, permiso) && tieneRecurso(user?.permisos, recurso)

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default RequirePermission