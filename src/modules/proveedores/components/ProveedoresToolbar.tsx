import Icon from '../../../components/common/Icon'
import FilterCombobox, { type FilterOption } from '../../../components/common/FilterCombobox'

interface ProveedoresToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  departamentoOptions: FilterOption[]
  selectedDepartamento: number | undefined
  onDepartamentoChange: (value: number | undefined) => void
}

export default function ProveedoresToolbar({
  search,
  onSearchChange,
  departamentoOptions,
  selectedDepartamento,
  onDepartamentoChange,
}: ProveedoresToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1 rounded-xl border border-gray-200/80 bg-white p-3 shadow-soft">
        <div className="flex h-10 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-gray-400 transition-colors focus-within:border-primary-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-blue/15">
          <Icon name="icon-search" className="size-5 shrink-0" />
          <label htmlFor="proveedores-search" className="sr-only">
            Buscar proveedores
          </label>
          <input
            id="proveedores-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, NIT o teléfono…"
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

      <FilterCombobox
        ariaLabel="Filtrar por departamento"
        allLabel="Todos los departamentos"
        emptyLabel="No se encontraron departamentos."
        items={departamentoOptions}
        value={selectedDepartamento}
        onChange={onDepartamentoChange}
        className="h-10 sm:w-64"
      />
    </div>
  )
}
