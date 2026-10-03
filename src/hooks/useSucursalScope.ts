import { useCallback, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useSucursalStore } from '../store/sucursalStore'
import { esAdministrador } from '../lib/roles'
import type { SucursalInventario } from '../modules/inventario/types/inventarioSucursal'
import type { UserSucursal } from '../types/user'

export type SucursalScopeMode = 'auto' | 'select-propio' | 'select-todas'

export interface SucursalScope {
  sucursalesPropias: SucursalInventario[]
  mode: SucursalScopeMode
  sucursalFija: SucursalInventario | null
  needsSelection: boolean
  selectSucursal: (sucursal: UserSucursal) => void
}

function toSucursalInventario(sucursal: UserSucursal): SucursalInventario {
  return {
    idSucursal: sucursal.idSucursal,
    codigoSucursal: '',
    nitSucursal: '',
    nombreSucursal: sucursal.nombreSucursal,
    sucursalActiva: true,
    idDepartamento: 0,
  }
}

function buildSucursalesPropias(
  userSucursales: UserSucursal[] | undefined,
  fallback: { idSucursal: number; nombreSucursal: string } | null,
): SucursalInventario[] {
  if (userSucursales && userSucursales.length > 0) {
    return userSucursales.map(toSucursalInventario)
  }
  return fallback ? [toSucursalInventario(fallback)] : []
}

export function useSucursalScope(): SucursalScope {
  const user = useAuthStore((s) => s.user)
  const activeSucursal = useSucursalStore((s) => s.activeSucursal)
  const activeUserId = useSucursalStore((s) => s.userId)
  const storeSetActive = useSucursalStore((s) => s.setActiveSucursal)

  const isAdmin = esAdministrador(user)

  const userSucursales = user?.sucursales
  const userIdSucursal = user?.idSucursal
  const userNombreSucursal = user?.nombreSucursal

  const sucursalesPropias = useMemo<SucursalInventario[]>(() => {
    const fallback =
      userIdSucursal != null && userNombreSucursal
        ? { idSucursal: Number(userIdSucursal), nombreSucursal: userNombreSucursal }
        : null
    return buildSucursalesPropias(userSucursales, fallback)
  }, [userSucursales, userIdSucursal, userNombreSucursal])

  const validIds = useMemo(
    () => new Set(sucursalesPropias.map((s) => s.idSucursal)),
    [sucursalesPropias],
  )

  const activeValida = useMemo<SucursalInventario | null>(() => {
    if (isAdmin) return null
    if (!activeSucursal || !user) return null
    if (activeUserId !== user.id) return null
    if (!validIds.has(activeSucursal.idSucursal)) return null
    return toSucursalInventario(activeSucursal)
  }, [activeSucursal, activeUserId, user, validIds, isAdmin])

  const mode = useMemo<SucursalScopeMode>(() => {
    if (isAdmin) return 'select-todas'
    if (activeValida) return 'auto'
    if (sucursalesPropias.length === 1) return 'auto'
    if (sucursalesPropias.length > 1) return 'select-propio'
    return 'select-todas'
  }, [activeValida, sucursalesPropias, isAdmin])

  const sucursalFija = useMemo<SucursalInventario | null>(() => {
    if (activeValida) return activeValida
    if (mode === 'auto' && sucursalesPropias.length === 1) return sucursalesPropias[0]
    return null
  }, [activeValida, mode, sucursalesPropias])

  const needsSelection =
    !isAdmin && sucursalesPropias.length > 1 && activeValida === null

  const selectSucursal = useCallback(
    (sucursal: UserSucursal) => {
      if (!user) return
      storeSetActive(user.id, {
        idSucursal: sucursal.idSucursal,
        nombreSucursal: sucursal.nombreSucursal,
      })
    },
    [user, storeSetActive],
  )

  return {
    sucursalesPropias,
    mode,
    sucursalFija,
    needsSelection,
    selectSucursal,
  }
}

export function useActiveSucursal(): SucursalInventario | null {
  return useSucursalScope().sucursalFija
}
