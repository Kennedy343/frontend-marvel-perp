import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import FilterCombobox, {
  type FilterOption,
} from '../../../components/common/FilterCombobox'
import SucursalCombobox from '../../../components/common/SucursalCombobox'
import type { SucursalInventario } from '../../inventario/types/inventarioSucursal'

interface VentasFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedSucursal: number | undefined
  onSucursalChange: (id: number | undefined) => void
  facturadaFilter: boolean | undefined
  onFacturadaChange: (val: boolean | undefined) => void
  activaFilter: boolean | undefined
  onActivaChange: (val: boolean | undefined) => void
  sucursales: SucursalInventario[]
  showSucursalFilter: boolean
  fixedSucursalNombre?: string
  allowAllSucursales?: boolean
  onReset: () => void
}

const comboboxClass =
  'h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

const FACTURADA_OPTIONS: FilterOption<string>[] = [
  { value: 'true', label: 'Facturadas' },
  { value: 'false', label: 'Sin facturar' },
]

const ESTADO_OPTIONS: FilterOption<string>[] = [
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Anuladas' },
]

function toBooleanValue(val: string | undefined): boolean | undefined {
  return val === undefined ? undefined : val === 'true'
}

export const VentasFilters = memo(function VentasFilters({
  search,
  onSearchChange,
  selectedSucursal,
  onSucursalChange,
  facturadaFilter,
  onFacturadaChange,
  activaFilter,
  onActivaChange,
  sucursales,
  showSucursalFilter,
  fixedSucursalNombre,
  allowAllSucursales = true,
  onReset,
}: VentasFiltersProps) {
  return (
    <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        {/* Buscador de texto */}
        <div className="lg:col-span-4">
          <label
            htmlFor="ventas-search-input"
            className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Buscar por factura o cliente
          </label>
          <div className="relative">
            <input
              id="ventas-search-input"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Serie, número o nombre de cliente…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 font-dm-sans text-sm text-navy-950 transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="icon-search" className="size-4" />
            </span>
          </div>
        </div>

        {/* Sucursal */}
        {showSucursalFilter ? (
          <div className="lg:col-span-3">
            <label
              htmlFor="ventas-sucursal-select"
              className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Sucursal
            </label>
            <SucursalCombobox
              id="ventas-sucursal-select"
              sucursales={sucursales}
              value={selectedSucursal}
              onChange={onSucursalChange}
              allowAll={allowAllSucursales}
              placeholder="Seleccione una sucursal…"
              className={comboboxClass}
            />
          </div>
        ) : (
          <div className="lg:col-span-3">
            <label
              htmlFor="ventas-sucursal-fija"
              className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Sucursal
            </label>
            <div
              id="ventas-sucursal-fija"
              className="flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 font-dm-sans text-sm font-medium text-navy-950"
            >
              <Icon name="icon-map-pin" className="size-4 shrink-0 text-primary-blue" />
              <span className="truncate">{fixedSucursalNombre}</span>
            </div>
          </div>
        )}

        {/* Facturada / Pendiente */}
        <div className="lg:col-span-2">
          <label
            htmlFor="ventas-facturada-select"
            className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Facturación
          </label>
          <FilterCombobox
            id="ventas-facturada-select"
            ariaLabel="Facturación"
            allLabel="Todas"
            emptyLabel="No se encontraron opciones."
            items={FACTURADA_OPTIONS}
            value={
              facturadaFilter === undefined ? undefined : facturadaFilter ? 'true' : 'false'
            }
            onChange={(val) => onFacturadaChange(toBooleanValue(val))}
            className={comboboxClass}
          />
        </div>

        {/* Estado (Activa / Anulada) */}
        <div className="lg:col-span-2">
          <label
            htmlFor="ventas-estado-select"
            className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Estado
          </label>
          <FilterCombobox
            id="ventas-estado-select"
            ariaLabel="Estado"
            allLabel="Todos"
            emptyLabel="No se encontraron opciones."
            items={ESTADO_OPTIONS}
            value={activaFilter === undefined ? undefined : activaFilter ? 'true' : 'false'}
            onChange={(val) => onActivaChange(toBooleanValue(val))}
            className={comboboxClass}
          />
        </div>

        {/* Limpiar */}
        <div className="lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 font-dm-sans text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-navy-950"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  )
})
