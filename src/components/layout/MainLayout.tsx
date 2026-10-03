import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { useSucursalScope } from '../../hooks/useSucursalScope'

// Code-split: el palette y el gate de sucursal solo se descargan cuando se usan.
const CommandPalette = lazy(() => import('../common/CommandPalette'))
const SucursalGate = lazy(() => import('./SucursalGate'))

function MainLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const {
    sucursalesPropias,
    mode: sucursalMode,
    sucursalFija,
    needsSelection,
    selectSucursal,
  } = useSucursalScope()

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      setPaletteOpen(true)
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const userName = user?.nombreCompleto || 'Usuario Marvel'
  const userRole = user?.rolAsignado || 'Usuario'

  const sucursalLabel = useMemo(() => {
    if (sucursalMode === 'auto' && sucursalFija) return sucursalFija.nombreSucursal
    if (sucursalMode === 'select-propio') return `${sucursalesPropias.length} sucursales`
    return 'Todas las sucursales'
  }, [sucursalMode, sucursalFija, sucursalesPropias])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-bg-gray">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        userName={userName}
        userRole={userRole}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        permisos={user?.permisos}
      />
      <div className={`min-h-dvh transition-[padding] duration-300 ease-in-out ${collapsed ? 'lg:pl-20' : 'lg:pl-70'}`}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
          userName={userName}
          sucursalName={sucursalLabel}
        />
        <main className="px-5 py-8 sm:px-8 lg:px-10">
          {needsSelection ? (
            <Suspense fallback={null}>
              <SucursalGate
                sucursales={user?.sucursales ?? []}
                userName={userName}
                onSelect={selectSucursal}
              />
            </Suspense>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      {paletteOpen ? (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setPaletteOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  )
}

export default MainLayout
