import { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoUrl from '../../assets/logoMarvel.png'
import Icon from '../common/Icon'
import { navigation } from '../../lib/navigation'
import { tienePermiso, tieneRecurso } from '../../lib/permisos'
import type { NavigationItem, NavigationSection } from '../../types/nav'

interface SidebarProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
  userName: string
  userRole: string
  collapsed: boolean
  onToggleCollapsed: () => void
  permisos?: string[]
}

function filtrarItem(item: NavigationItem, permisos: string[] | undefined): NavigationItem | null {
  if (item.children) {
    const children = item.children.flatMap((child) => {
      const filtered = filtrarItem(child, permisos)
      return filtered ? [filtered] : []
    })
    if (children.length === 0) return null
    return { ...item, children }
  }
  if (item.permiso && !tienePermiso(permisos, item.permiso)) return null
  if (item.recurso && !tieneRecurso(permisos, item.recurso)) return null
  return item
}

function filtrarNavigation(
  sections: NavigationSection[],
  permisos: string[] | undefined,
): NavigationSection[] {
  return sections.flatMap((section) => {
    const items = section.items.flatMap((item) => {
      const filtered = filtrarItem(item, permisos)
      return filtered ? [filtered] : []
    })
    return items.length > 0 ? [{ ...section, items }] : []
  })
}

function Sidebar({ open, onClose, onLogout, userName, userRole, collapsed, onToggleCollapsed, permisos }: SidebarProps) {
  const { pathname } = useLocation()
  const rail = collapsed && !open

  const items = useMemo(() => filtrarNavigation(navigation, permisos), [permisos])

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const keys: string[] = []
    for (const section of items) {
      for (const item of section.items) {
        if (item.children?.some((child) => child.path === pathname)) keys.push(item.key)
      }
    }
    return keys
  })

  const toggleKey = (key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const handleParentClick = (key: string) => {
    if (rail) {
      setOpenKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
      onToggleCollapsed()
      return
    }
    toggleKey(key)
  }

  const activeAccent =
    'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-primary-blue'

  const renderItem = (item: NavigationItem, nested = false) => {
    const children = item.children ?? []
    const hasChildren = children.length > 0

    if (hasChildren) {
      const isOpen = openKeys.includes(item.key)
      const hasActiveChild = children.some((child) => child.path === pathname)

      return (
        <div key={item.key}>
          <button
            type="button"
            onClick={() => handleParentClick(item.key)}
            aria-expanded={isOpen}
            title={rail ? item.label : undefined}
            className={`relative flex w-full items-center gap-2 py-3 text-sm font-semibold transition-colors ${
              rail ? 'justify-center px-0' : 'pl-5 pr-3'
            } ${
              rail
                ? hasActiveChild || isOpen
                  ? 'text-primary-blue'
                  : 'text-gray-500 hover:text-gray-900'
                : hasActiveChild || isOpen
                  ? 'bg-blue-50 text-primary-blue'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon && <Icon name={item.icon} className="size-5 shrink-0" />}
            <span className={`shrink-0 ${rail ? 'hidden' : ''}`}>{item.label}</span>
            {!rail && (
              <Icon
                name="icon-chevron-down"
                className={`size-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
          {!rail && isOpen && (
            <div className="mt-1">
              {children.map((child) => renderItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.key}
        to={item.path}
        onClick={onClose}
        end
        title={rail ? item.label : undefined}
        className={({ isActive }) =>
          `relative flex items-center gap-3 py-3 text-sm font-semibold transition-colors ${
            rail ? 'justify-center px-0' : nested ? 'pl-9 pr-4' : 'px-5'
          } ${
            rail
              ? isActive
                ? 'text-primary-blue'
                : 'text-gray-500 hover:text-gray-900'
              : isActive
                ? `bg-blue-50 text-primary-blue ${activeAccent}`
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
      >
        {item.icon && <Icon name={item.icon} className="size-5 shrink-0" />}
        <span className={rail ? 'hidden' : ''}>{item.label}</span>
      </NavLink>
    )
  }

  const renderSections = (sections: NavigationSection[]) =>
    sections.map((section) => (
      <section key={section.label ?? 'navigation'} className="mb-5">
        {section.label && (
          <p className={`mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400 ${rail ? 'hidden' : ''}`}>
            {section.label}
          </p>
        )}
        <div className="space-y-1">
          {section.items.map((item) => renderItem(item))}
        </div>
      </section>
    ))

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy-950/30 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-[width,transform] duration-300 ease-in-out motion-reduce:transition-none lg:translate-x-0 ${
          rail ? 'w-20 max-w-20' : 'w-70 max-w-[calc(100vw-2rem)]'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navegación principal"
      >
        {rail ? (
          <div className="flex flex-col items-center gap-4 border-b border-gray-200 px-2 py-5">
            <img src={logoUrl} alt="Logo Marvel" className="size-10 object-contain" />
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Expandir menú"
            >
              <Icon name="icon-sidebar-up" className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex h-26 items-center justify-between border-b border-gray-200 px-6">
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="Logo Marvel" className="size-11 object-contain" />
              <div>
                <p className="font-sora text-sm font-semibold text-navy-950">Sistema Marvel</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleCollapsed}
                className="hidden rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:block"
                aria-label="Ocultar menú"
              >
                <Icon name="icon-sidebar-down" className="size-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                aria-label="Cerrar menú"
              >
                <Icon name="icon-close" className="size-5" />
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-6">{renderSections(items)}</nav>

        <div className="border-t border-gray-200 px-3 py-5">
          <div
            className={`flex items-center gap-3 ${rail ? 'flex-col px-0' : 'px-3'}`}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-blue text-sm font-semibold text-white">
              {userName.charAt(0).toUpperCase() || 'U'}
            </span>
            {!rail && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">{userName}</p>
                <p className="truncate text-xs text-gray-500">{userRole}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-error-red"
              aria-label="Cerrar sesión"
            >
              <Icon name="icon-logout" className="size-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar