import { memo, useMemo } from 'react'
import type { SucursalInventario } from '../types/inventarioSucursal'
import type { Producto } from '../types/producto'
import Icon from '../../../components/common/Icon'
import FilterCombobox, {
  type FilterOption,
} from '../../../components/common/FilterCombobox'
import SucursalCombobox from '../../../components/common/SucursalCombobox'

const comboboxClass =
  'h-9 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

interface KardexFiltersProps {
  sucursales: SucursalInventario[]
  productoResultados: Producto[]
  productoSeleccionado: Producto | null
  onProductoSearchChange: (val: string) => void
  isSearchingProductos: boolean
  showSucursalFilter: boolean
  fixedSucursalNombre?: string
  selectedSucursal: number | undefined
  onSelectSucursal: (id: number | undefined) => void
  selectedProducto: number | undefined
  onSelectProducto: (id: number | undefined) => void
  stockBajoOnly: boolean
  onToggleStockBajo: (val: boolean) => void
  searchTerm: string
  onSearchChange: (val: string) => void
  onRefresh: () => void
  loading: boolean
}

export const KardexFilters = memo(function KardexFilters({
  sucursales,
  productoResultados,
  productoSeleccionado,
  onProductoSearchChange,
  isSearchingProductos,
  showSucursalFilter,
  fixedSucursalNombre,
  selectedSucursal,
  onSelectSucursal,
  selectedProducto,
  onSelectProducto,
  stockBajoOnly,
  onToggleStockBajo,
  searchTerm,
  onSearchChange,
  onRefresh,
  loading,
}: KardexFiltersProps) {
  const productoOptions = useMemo<FilterOption[]>(() => {
    const productos = productoSeleccionado
      ? [
          productoSeleccionado,
          ...productoResultados.filter(
            (p) => p.idProducto !== productoSeleccionado.idProducto,
          ),
        ]
      : productoResultados
    return productos.map((producto) => ({
      value: producto.idProducto,
      label: `[${producto.codigoProducto}] ${producto.nombreProducto}`,
    }))
  }, [productoSeleccionado, productoResultados])

  return (
    <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-card">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-12 md:items-end">
        {/* Buscador de texto */}
        <div className="md:col-span-5">
          <label
            htmlFor="kardex-search-input"
            className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Buscar producto o sucursal
          </label>
          <div className="relative">
            <input
              id="kardex-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por código, nombre…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pr-3 pl-9 font-dm-sans text-sm text-navy-950 transition-colors placeholder:text-gray-400 focus:border-primary-blue focus:bg-white focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Icon name="icon-search" className="size-4" />
            </span>
          </div>
        </div>

        {/* Filtro por Sucursal */}
        {showSucursalFilter ? (
          <div className="md:col-span-3">
            <label
              htmlFor="kardex-sucursal-select"
              className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Sucursal
            </label>
            <SucursalCombobox
              id="kardex-sucursal-select"
              sucursales={sucursales}
              value={selectedSucursal}
              onChange={onSelectSucursal}
              className={comboboxClass}
            />
          </div>
        ) : (
          <div className="md:col-span-3">
            <label
              htmlFor="kardex-sucursal-fija"
              className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Sucursal
            </label>
            <div
              id="kardex-sucursal-fija"
              className="flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 font-dm-sans text-sm font-medium text-navy-950"
            >
              <Icon name="icon-map-pin" className="size-4 shrink-0 text-primary-blue" />
              <span className="truncate">{fixedSucursalNombre}</span>
            </div>
          </div>
        )}

        {/* Filtro por Producto */}
        <div className="md:col-span-4">
          <label
            htmlFor="kardex-producto-select"
            className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600"
          >
            Producto específico
          </label>
          <FilterCombobox
            id="kardex-producto-select"
            ariaLabel="Producto"
            searchable
            clearOnFocus
            remoteSearch
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
      </div>

      {/* Acciones: filtro rápido y recarga */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={stockBajoOnly}
          aria-label="Filtrar solo productos con stock bajo"
          onClick={() => onToggleStockBajo(!stockBajoOnly)}
          className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3.5 font-dm-sans text-xs font-semibold transition-colors ${
            stockBajoOnly
              ? 'border-red-200 bg-red-50 text-error-red shadow-sm hover:bg-red-100/70'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Icon
            name="icon-production-quantity-limits"
            className={`size-4 shrink-0 ${stockBajoOnly ? 'text-error-red' : 'text-gray-400'}`}
          />
          <span>Solo stock bajo</span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar existencias de inventario"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 font-dm-sans text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:border-primary-blue hover:text-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            name="icon-refresh"
            className={`size-4 shrink-0 ${loading ? 'animate-spin text-primary-blue' : 'text-gray-500'}`}
          />
          <span>{loading ? 'Actualizando…' : 'Actualizar'}</span>
        </button>
      </div>
    </section>
  )
})
