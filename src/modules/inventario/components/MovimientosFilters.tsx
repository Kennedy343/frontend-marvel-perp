import { memo, useMemo } from 'react'
import Icon from '../../../components/common/Icon'
import { DatePicker } from '../../../components/ui/date-picker'
import FilterCombobox, {
  type FilterOption,
} from '../../../components/common/FilterCombobox'
import SucursalCombobox from '../../../components/common/SucursalCombobox'
import {
  ORIGEN_MOVIMIENTO_OPTIONS,
  TIPO_MOVIMIENTO_OPTIONS,
} from '../lib/etiquetas'
import type { OrigenMovimiento, TipoMovimiento } from '../types/movimiento'
import type { Producto } from '../types/producto'
import type { SucursalInventario } from '../types/inventarioSucursal'

interface MovimientosFiltersProps {
  productoResultados: Producto[]
  productoSeleccionado: Producto | null
  onProductoSearchChange: (val: string) => void
  isSearchingProductos: boolean
  sucursales: SucursalInventario[]
  showSucursalFilter: boolean
  fixedSucursalNombre?: string
  selectedProducto: number | undefined
  onSelectProducto: (id: number | undefined) => void
  selectedSucursal: number | undefined
  onSelectSucursal: (id: number | undefined) => void
  tipo: TipoMovimiento | undefined
  onSelectTipo: (val: TipoMovimiento | undefined) => void
  origen: OrigenMovimiento | undefined
  onSelectOrigen: (val: OrigenMovimiento | undefined) => void
  desde: string
  onDesdeChange: (val: string) => void
  hasta: string
  onHastaChange: (val: string) => void
  onReset: () => void
  onRefresh: () => void
  loading: boolean
}

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 font-dm-sans text-sm text-navy-950 transition-colors focus:border-primary-blue focus:bg-white focus:outline-none'

const comboboxClass =
  'h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

const labelClass =
  'mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600'

export const MovimientosFilters = memo(function MovimientosFilters({
  productoResultados,
  productoSeleccionado,
  onProductoSearchChange,
  isSearchingProductos,
  sucursales,
  showSucursalFilter,
  fixedSucursalNombre,
  selectedProducto,
  onSelectProducto,
  selectedSucursal,
  onSelectSucursal,
  tipo,
  onSelectTipo,
  origen,
  onSelectOrigen,
  desde,
  onDesdeChange,
  hasta,
  onHastaChange,
  onReset,
  onRefresh,
  loading,
}: MovimientosFiltersProps) {
  const productoOptions = useMemo<FilterOption[]>(() => {
    const productos = productoSeleccionado
      ? [
          productoSeleccionado,
          ...productoResultados.filter(
            (p) => p.idProducto !== productoSeleccionado.idProducto,
          ),
        ]
      : productoResultados
    return productos.map((p) => ({
      value: p.idProducto,
      label: `${p.codigoProducto} — ${p.nombreProducto}`,
    }))
  }, [productoSeleccionado, productoResultados])

  return (
    <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="mov-producto" className={labelClass}>
            Producto
          </label>
          <FilterCombobox
            id="mov-producto"
            searchable
            clearOnFocus
            remoteSearch
            ariaLabel="Producto"
            placeholder="Todos los productos"
            emptyLabel="No se encontraron productos."
            searchHint="Escriba al menos 3 caracteres para buscar…"
            minSearchLength={3}
            isSearching={isSearchingProductos}
            onSearchChange={onProductoSearchChange}
            items={productoOptions}
            value={selectedProducto}
            onChange={onSelectProducto}
            className={comboboxClass}
          />
        </div>

        {showSucursalFilter ? (
          <div>
            <label htmlFor="mov-sucursal" className={labelClass}>
              Sucursal
            </label>
            <SucursalCombobox
              id="mov-sucursal"
              sucursales={sucursales}
              value={selectedSucursal}
              onChange={onSelectSucursal}
              className={comboboxClass}
            />
          </div>
        ) : (
          <div>
            <p className={labelClass}>Sucursal</p>
            <div className="flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 font-dm-sans text-sm font-medium text-navy-950">
              <Icon name="icon-map-pin" className="size-4 shrink-0 text-primary-blue" />
              <span className="truncate">{fixedSucursalNombre}</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="mov-tipo" className={labelClass}>
            Tipo
          </label>
          <FilterCombobox
            id="mov-tipo"
            ariaLabel="Tipo"
            allLabel="Entradas y salidas"
            emptyLabel="No se encontraron tipos."
            items={TIPO_MOVIMIENTO_OPTIONS}
            value={tipo}
            onChange={onSelectTipo}
            className={comboboxClass}
          />
        </div>

        <div>
          <label htmlFor="mov-origen" className={labelClass}>
            Origen
          </label>
          <FilterCombobox
            id="mov-origen"
            ariaLabel="Origen"
            allLabel="Todos los orígenes"
            emptyLabel="No se encontraron orígenes."
            items={ORIGEN_MOVIMIENTO_OPTIONS}
            value={origen}
            onChange={onSelectOrigen}
            className={comboboxClass}
          />
        </div>

        <div>
          <label htmlFor="mov-desde" className={labelClass}>
            Desde
          </label>
          <DatePicker
            id="mov-desde"
            aria-label="Fecha desde"
            value={desde}
            onChange={onDesdeChange}
            max={hasta || undefined}
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="mov-hasta" className={labelClass}>
            Hasta
          </label>
          <DatePicker
            id="mov-hasta"
            aria-label="Fecha hasta"
            value={hasta}
            onChange={onHastaChange}
            min={desde || undefined}
            className={selectClass}
          />
        </div>

        <div className="flex items-end gap-2 lg:col-span-2">
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
