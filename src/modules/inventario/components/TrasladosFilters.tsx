import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import FilterCombobox from '../../../components/common/FilterCombobox'
import { ESTADO_TRASLADO_OPTIONS } from '../lib/etiquetas'
import type { EstadoTraslado } from '../types/traslado'

interface TrasladosFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  estado: EstadoTraslado | undefined
  onEstadoChange: (value: EstadoTraslado | undefined) => void
  onReset: () => void
  onRefresh: () => void
  loading: boolean
}

const labelClass =
  'mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600'

const comboboxClass =
  'h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

export const TrasladosFilters = memo(function TrasladosFilters({
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  onReset,
  onRefresh,
  loading,
}: TrasladosFiltersProps) {
  return (
    <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <div className="lg:col-span-2">
          <label htmlFor="traslados-search" className={labelClass}>
            Buscar por sucursal, motivo o número
          </label>
          <div className="relative">
            <input
              id="traslados-search"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Origen, destino, motivo o #ID…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 font-dm-sans text-sm text-navy-950 transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="icon-search" className="size-4" />
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="traslados-estado" className={labelClass}>
            Estado
          </label>
          <FilterCombobox
            id="traslados-estado"
            ariaLabel="Estado"
            allLabel="Todos los estados"
            emptyLabel="No se encontraron estados."
            items={ESTADO_TRASLADO_OPTIONS}
            value={estado}
            onChange={onEstadoChange}
            className={comboboxClass}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 font-dm-sans text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-navy-950"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 font-dm-sans text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name="icon-refresh"
              className={`size-4 ${loading ? 'animate-spin' : ''}`}
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </section>
  )
})
