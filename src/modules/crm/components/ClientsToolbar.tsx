import Icon from '../../../components/common/Icon'

interface ClientsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
}

function ClientsToolbar({ search, onSearchChange }: ClientsToolbarProps) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-soft">
      <div className="flex h-10 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-gray-400 transition-colors focus-within:border-primary-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-blue/15">
        <Icon name="icon-search" className="size-5 shrink-0" />
        <label htmlFor="clients-search" className="sr-only">
          Buscar clientes
        </label>
        <input
          id="clients-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, apellido o DPI…"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpiar búsqueda"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
          >
            <Icon name="icon-close" className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ClientsToolbar
