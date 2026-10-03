import { memo, useCallback, useMemo } from 'react'
import type { Producto } from '../../inventario/types/producto'
import FilterCombobox, {
  type FilterOption,
} from '../../../components/common/FilterCombobox'

interface ProductoSelectorProps {
  productos: Producto[]
  selectedId: string
  onSearchChange: (value: string) => void
  onSelect: (idProducto: string) => void
  idSucursal?: number
  isLoading?: boolean
  disabled?: boolean
  hasError?: boolean
}

const comboboxClass =
  'h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

function getStock(producto: Producto, idSucursal?: number): number | null {
  if (idSucursal == null) return null
  const inv = producto.inventarios?.find((i) => i.idSucursal === idSucursal && i.activo)
  return inv ? inv.stockActual : 0
}

function ProductoSelectorBase({
  productos,
  selectedId,
  onSearchChange,
  onSelect,
  idSucursal,
  isLoading = false,
  disabled = false,
  hasError = false,
}: ProductoSelectorProps) {
  const productoOptions = useMemo<FilterOption[]>(() => {
    const selected = productos.find((p) => String(p.idProducto) === selectedId)
    const list = selected
      ? [selected, ...productos.filter((p) => p.idProducto !== selected.idProducto)]
      : productos
    return list.map((p) => ({
      value: p.idProducto,
      label: `${p.codigoProducto} — ${p.nombreProducto}`,
    }))
  }, [productos, selectedId])

  const renderStock = useCallback(
    (idProducto: number) => {
      const producto = productos.find((p) => p.idProducto === idProducto)
      if (!producto) return null
      const stock = getStock(producto, idSucursal)
      if (stock === null) return null
      return (
        <span
          className={`shrink-0 font-mono font-medium ${
            stock === 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}
          title="Stock en la sucursal seleccionada"
        >
          {stock} u
        </span>
      )
    },
    [productos, idSucursal],
  )

  return (
    <div>
      <p className="mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
        Buscar producto *
      </p>
      <FilterCombobox
        id="detalle-producto-busqueda"
        searchable
        remoteSearch
        ariaLabel="Producto"
        placeholder="Buscar por código o nombre…"
        emptyLabel="No se encontró ningún producto."
        searchHint="Escriba al menos 3 caracteres para buscar…"
        minSearchLength={3}
        isSearching={isLoading}
        onSearchChange={onSearchChange}
        items={productoOptions}
        value={selectedId ? Number(selectedId) : undefined}
        onChange={(id) => onSelect(id != null ? String(id) : '')}
        disabled={disabled}
        invalid={hasError}
        renderItemExtra={renderStock}
        className={comboboxClass}
      />
    </div>
  )
}

export const ProductoSelector = memo(ProductoSelectorBase)
