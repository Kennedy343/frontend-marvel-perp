import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import { DatePicker } from '../../../components/ui/date-picker'

interface ComprasFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  fechaInicio: string
  onFechaInicioChange: (value: string) => void
  fechaFinal: string
  onFechaFinalChange: (value: string) => void
  onReset: () => void
}

const labelClass =
  'mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600'

const datePickerClass =
  'h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus:border-primary-blue focus:bg-white focus:outline-none'

export const ComprasFilters = memo(function ComprasFilters({
  search,
  onSearchChange,
  fechaInicio,
  onFechaInicioChange,
  fechaFinal,
  onFechaFinalChange,
  onReset,
}: ComprasFiltersProps) {
  const hasActiveFilters = Boolean(search || fechaInicio || fechaFinal)

  return (
    <section
      aria-label="Filtros de compras"
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-card"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
        {/* Buscador de texto */}
        <div className="lg:col-span-5">
          <label htmlFor="compras-search-input" className={labelClass}>
            Buscar compra
          </label>
          <div className="relative">
            <input
              id="compras-search-input"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Serie, número o proveedor…"
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 font-dm-sans text-sm text-navy-950 transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="icon-search" className="size-4" />
            </span>
          </div>
        </div>

        {/* Fecha Inicio */}
        <div className="lg:col-span-3">
          <label htmlFor="compras-fecha-inicio" className={labelClass}>
            Fecha Inicio
          </label>
          <DatePicker
            id="compras-fecha-inicio"
            aria-label="Fecha de inicio"
            placeholder="Desde…"
            value={fechaInicio}
            onChange={onFechaInicioChange}
            max={fechaFinal || undefined}
            clearable
            className={datePickerClass}
          />
        </div>

        {/* Fecha Final */}
        <div className="lg:col-span-3">
          <label htmlFor="compras-fecha-final" className={labelClass}>
            Fecha Final
          </label>
          <DatePicker
            id="compras-fecha-final"
            aria-label="Fecha final"
            placeholder="Hasta…"
            value={fechaFinal}
            onChange={onFechaFinalChange}
            min={fechaInicio || undefined}
            clearable
            className={datePickerClass}
          />
        </div>

        {/* Botón Limpiar */}
        <div className="lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-200 bg-white font-dm-sans text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-navy-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpiar
          </button>
        </div>
      </div>
    </section>
  )
})

export default ComprasFilters
