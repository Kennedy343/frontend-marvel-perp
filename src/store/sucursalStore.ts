import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { UserSucursal } from '../types/user'

const STORAGE_KEY = 'marvel-sucursal'
const STORAGE_VERSION = 1

interface SucursalStore {
  activeSucursal: UserSucursal | null
  userId: number | string | null
  setActiveSucursal: (userId: number | string, sucursal: UserSucursal) => void
  clearActiveSucursal: () => void
}

export const useSucursalStore = create<SucursalStore>()(
  persist(
    (set) => ({
      activeSucursal: null,
      userId: null,
      setActiveSucursal: (userId, activeSucursal) => set({ userId, activeSucursal }),
      clearActiveSucursal: () => set({ activeSucursal: null, userId: null }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSucursal: state.activeSucursal,
        userId: state.userId,
      }),
    },
  ),
)
