import Icon from '../common/Icon'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

interface HeaderProps {
  onMenuClick: () => void
  onOpenSearch: () => void
  userName: string
  sucursalName?: string | null
}

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
const SHORTCUT_KEY = IS_MAC ? '⌘' : 'Ctrl'

function Header({ onMenuClick, onOpenSearch, userName, sucursalName }: HeaderProps) {
  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 sm:px-8 lg:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Abrir menú"
        >
          <Icon name="icon-menu" className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Buscar páginas y acciones"
          className="flex h-10 w-full max-w-md items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-left transition-colors hover:border-gray-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-search" className="size-5 shrink-0 text-gray-400" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-400">
            Buscar en Marvel…
          </span>
          <KbdGroup className="hidden sm:inline-flex">
            <Kbd>{SHORTCUT_KEY}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {sucursalName && (
          <div
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 sm:px-3"
            title={sucursalName}
            aria-label={`Sucursal: ${sucursalName}`}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary-blue">
              <Icon name="icon-map-pin" className="size-3.5" />
            </span>
            <span className="hidden max-w-40 truncate font-dm-sans text-xs font-semibold text-navy-950 sm:block">
              {sucursalName}
            </span>
          </div>
        )}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Notificaciones"
        >
          <Icon name="icon-bell" className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary-blue" />
        </button>
        <button
          type="button"
          className="hidden rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:block"
          aria-label="Configuración"
        >
          <Icon name="icon-settings" className="size-5" />
        </button>
        <div className="hidden h-7 w-px bg-gray-200 sm:block" />
        <div
          className="flex items-center gap-2 p-1.5"
          title={userName}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-blue text-xs font-semibold text-white">
            {userName.charAt(0).toUpperCase() || 'U'}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-700 md:block">{userName}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
