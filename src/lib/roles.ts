import type { User } from '../types/user'

export const ADMIN_ROLE = 'Administrador'

export function esAdministrador(user: User | null | undefined): boolean {
  if (!user?.rolAsignado) return false
  return user.rolAsignado.split(',').some((rol) => rol.trim() === ADMIN_ROLE)
}
