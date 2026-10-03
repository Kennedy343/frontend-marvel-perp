import { create } from 'zustand'
import { authService } from '../modules/auth/services/authService'
import api from '../lib/axios'
import { getAccessToken, setAccessToken, clearAccessToken } from '../lib/token'
import { clearDraftsForUser } from '../lib/draftStorage'
import { useSucursalStore } from './sucursalStore'
import type { LoginCredentials, RefreshResponse } from '../types/auth'
import type { User } from '../types/user'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isHydrated: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  hydrateSession: () => Promise<void>
  checkSession: () => boolean
}

let hydrating = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: getAccessToken(),
  isLoading: false,
  isHydrated: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { accessToken, user } = await authService.login(credentials)
      setAccessToken(accessToken)
      const perfil = await authService.getMe()
      set({ user: { ...user, ...perfil }, accessToken, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ocurrió un error',
      })
      throw error
    }
  },

  logout: async () => {
    const userId = get().user?.id
    try {
      await authService.logout()
    } finally {
      if (userId != null) clearDraftsForUser(userId)
      clearAccessToken()
      useSucursalStore.getState().clearActiveSucursal()
      set({ user: null, accessToken: null })
    }
  },

  hydrateSession: async () => {
    if (hydrating) return
    hydrating = true
    try {
      const { data } = await api.post<RefreshResponse>('/auth/refresh')
      setAccessToken(data.accessToken)
      const user = await authService.getMe()
      set({ user, accessToken: data.accessToken, error: null })
    } catch {
      clearAccessToken()
      set({ user: null, accessToken: null })
    } finally {
      hydrating = false
      set({ isHydrated: true })
    }
  },

  checkSession: () => Boolean(get().accessToken && get().user),
}))