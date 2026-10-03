import { memo, useCallback, useMemo } from 'react'
import Icon from '../../../components/common/Icon'
import type { DetalleVentaRow } from '../hooks/useCreateVenta'
import type { Producto } from '../../inventario/types/producto'
import { ProductoSelector } from './ProductoSelector'
import { GuardarVentaButton } from './GuardarVentaButton'

interface VentaOrderLedgerProps {
  productos: Producto[]
  detalleInput: {
    idProducto: string
    idTipoPrecio: string
    cantidad: string
  }
  errors: Record<string, string>
  currentStock: number | null
  currentUnitPrice: number
  sucursalSelected: boolean
  idSucursal?: number
  detalles: DetalleVentaRow[]
  totalVenta: number
  isSubmitting: boolean
  canSubmit: boolean
  onGuardar: () => void
  onProductoSearchChange: (value: string) => void
  isSearchingProductos?: boolean
  onDetalleInputChange: (field: string, value: string) => void
  onAgregarDetalle: () => void
  onQuitarDetalle: (tempId: string) => void
  onCantidadChange: (tempId: string, cantidad: number) => void
  onTipoPrecioChange: (tempId: string, idTipoPrecio: number) => void
}

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (val: number): string => moneyFormatter.format(val)

interface QuantityStepperProps {
  tempId: string
  cantidad: number
  stockDisponible?: number
  productoNombre: string
  onCantidadChange: (tempId: string, cantidad: number) => void
}

const QuantityStepper = memo(function QuantityStepper({
  tempId,
  cantidad,
  stockDisponible,
  productoNombre,
  onCantidadChange,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (cantidad > 1) {
      onCantidadChange(tempId, cantidad - 1)
    }
  }

  const handleIncrement = () => {
    if (stockDisponible !== undefined && cantidad >= stockDisponible) {
      return
    }
    onCantidadChange(tempId, cantidad + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (isNaN(val) || val <= 0) {
      onCantidadChange(tempId, 1)
    } else {
      onCantidadChange(tempId, val)
    }
  }

  const exceedsStock = stockDisponible !== undefined && cantidad > stockDisponible
  const atMaxStock = stockDisponible !== undefined && cantidad >= stockDisponible

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-2xs">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={cantidad <= 1}
          aria-label={`Disminuir cantidad de ${productoNombre}`}
          className="flex size-7 items-center justify-center rounded-l-md text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="select-none text-base font-bold leading-none">−</span>
        </button>
        <input
          type="number"
          min={1}
          max={stockDisponible ?? 9999}
          value={cantidad}
          onChange={handleInputChange}
          aria-label={`Cantidad de ${productoNombre}`}
          className={`w-12 border-x border-gray-200 py-1 text-center font-mono text-sm font-semibold text-navy-950 focus:outline-none ${
            exceedsStock ? 'bg-red-50 text-error-red' : 'bg-transparent'
          }`}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={atMaxStock}
          aria-label={`Aumentar cantidad de ${productoNombre}`}
          className="flex size-7 items-center justify-center rounded-r-md text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="icon-plus" className="size-3" />
        </button>
      </div>

      {exceedsStock && (
        <span className="font-dm-sans text-[10px] font-medium text-error-red">
          Stock insuficiente ({stockDisponible})
        </span>
      )}
    </div>
  )
})

export const VentaOrderLedger = memo(function VentaOrderLedger({
  productos,
  detalleInput,
  errors,
  currentStock,
  currentUnitPrice,
  sucursalSelected,
  idSucursal,
  detalles,
  totalVenta,
  isSubmitting,
  canSubmit,
  onGuardar,
  onProductoSearchChange,
  isSearchingProductos = false,
  onDetalleInputChange,
  onAgregarDetalle,
  onQuitarDetalle,
  onCantidadChange,
  onTipoPrecioChange,
}: VentaOrderLedgerProps) {
  const hasProductSelected = Boolean(detalleInput.idProducto)

  const totalUnits = useMemo(() => {
    return detalles.reduce((acc, curr) => acc + curr.cantidad, 0)
  }, [detalles])

  const handleProductSelect = useCallback(
    (id: string) => {
      onDetalleInputChange('idProducto', id)
    },
    [onDetalleInputChange],
  )

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-card">
      {/* Barra Superior de Búsqueda y Entrada Rápida */}
      <div className="border-b border-gray-100 bg-gray-50/50 p-4">
        {!sucursalSelected ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 font-dm-sans text-xs text-amber-800">
            <Icon name="icon-map-pin" className="size-4 shrink-0 text-amber-600" />
            <p className="font-medium">
              Seleccione una sucursal de despacho para consultar catálogo, existencias y precios.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <ProductoSelector
                productos={productos}
                selectedId={detalleInput.idProducto}
                onSearchChange={onProductoSearchChange}
                onSelect={handleProductSelect}
                idSucursal={idSucursal}
                isLoading={isSearchingProductos}
                disabled={!sucursalSelected}
                hasError={Boolean(errors.idProducto)}
              />
              {errors.idProducto && (
                <p className="mt-1 font-dm-sans text-xs text-error-red">{errors.idProducto}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onAgregarDetalle}
                disabled={!sucursalSelected || !detalleInput.idProducto || currentUnitPrice <= 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="icon-plus" className="size-4" />
                <span>Agregar a la orden</span>
              </button>
            </div>
          </div>
        )}

        {hasProductSelected && sucursalSelected && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200/60 bg-white px-3 py-2 font-dm-sans text-xs shadow-2xs">
            <span className="flex items-center gap-1.5">
              <span className="text-gray-500">Existencias:</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
                  currentStock === 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentStock ?? 0} disponibles
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="text-gray-500">Precio Sugerido:</span>
              <span
                className={`font-mono font-bold ${
                  currentUnitPrice > 0 ? 'text-navy-950' : 'text-error-red'
                }`}
              >
                {formatCurrency(currentUnitPrice)}
              </span>
            </span>

            {currentUnitPrice === 0 && (
              <span className="rounded bg-red-100 px-2 py-0.5 font-medium text-error-red">
                Sin precio activo en esta sucursal
              </span>
            )}
          </div>
        )}
      </div>

      {/* Encabezado de la Tabla de la Orden */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-cart" className="size-4" />
          </span>
          <h2 className="font-sora text-sm font-semibold text-navy-950">Hoja de Venta</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-dm-sans text-xs font-medium text-gray-600">
            {detalles.length} {detalles.length === 1 ? 'línea' : 'líneas'} ({totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'})
          </span>
        </div>
      </div>

      {/* Tabla Interactiva de Líneas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-dm-sans text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="w-10 px-4 py-3 text-center">
                #
              </th>
              <th scope="col" className="px-4 py-3">
                Producto / SKU
              </th>
              <th scope="col" className="w-44 px-4 py-3">
                Tipo de Precio
              </th>
              <th scope="col" className="w-32 px-4 py-3 text-right">
                Cantidad
              </th>
              <th scope="col" className="w-32 px-4 py-3 text-right">
                Precio Unit.
              </th>
              <th scope="col" className="w-32 px-4 py-3 text-right">
                Subtotal
              </th>
              <th scope="col" className="w-12 px-4 py-3 text-center">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {detalles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                    <Icon name="icon-cart" className="size-6" />
                  </div>
                  <p className="mt-3 font-sora text-sm font-semibold text-navy-950">
                    No hay productos en la orden
                  </p>
                  <p className="mt-1 font-dm-sans text-xs text-gray-500">
                    Busque un producto por código o nombre en el campo superior para agregarlo.
                  </p>
                </td>
              </tr>
            ) : (
              detalles.map((d, index) => (
                <tr key={d.tempId} className="group transition-colors hover:bg-blue-50/30">
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-950">
                      {d.producto?.nombreProducto || `Producto #${d.idProducto}`}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gray-400">
                        {d.producto?.codigoProducto ?? 'SKU —'}
                      </span>
                      {d.stockDisponible !== undefined && (
                        <span
                          className={`font-mono text-[11px] ${
                            d.stockDisponible === 0 ? 'text-error-red' : 'text-emerald-600'
                          }`}
                        >
                          • {d.stockDisponible} en stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={d.idTipoPrecio}
                      onChange={(e) => onTipoPrecioChange(d.tempId, Number(e.target.value))}
                      aria-label={`Tipo de precio de ${d.producto?.nombreProducto ?? `producto #${d.idProducto}`}`}
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-dm-sans text-xs font-medium text-navy-950 transition-colors focus:border-primary-blue focus:outline-none"
                    >
                      {d.opcionesPrecio.map((o) => (
                        <option key={o.idTipoPrecio} value={o.idTipoPrecio}>
                          {o.nombreTipoPrecio} ({formatCurrency(o.precioVenta)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <QuantityStepper
                      tempId={d.tempId}
                      cantidad={d.cantidad}
                      stockDisponible={d.stockDisponible}
                      productoNombre={d.producto?.nombreProducto ?? ''}
                      onCantidadChange={onCantidadChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-gray-600">
                    {formatCurrency(d.precioUnitario)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-navy-950 tabular-nums">
                    {formatCurrency(d.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onQuitarDetalle(d.tempId)}
                      title="Quitar producto"
                      aria-label={`Quitar ${d.producto?.nombreProducto ?? `producto #${d.idProducto}`} de la orden`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-gray-400 opacity-80 transition-all hover:bg-red-50 hover:text-error-red hover:opacity-100 group-hover:opacity-100"
                    >
                      <Icon name="icon-trash" className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pie: Total y Confirmación (solo desktop; en móvil usa la barra fija) */}
      <div className="hidden border-t border-gray-100 bg-gray-50/60 px-5 py-4 lg:flex lg:items-center lg:justify-between">
        <div>
          <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            Total a Pagar
          </p>
          <p className="font-sora text-2xl font-bold tracking-tight text-navy-950 tabular-nums">
            {formatCurrency(totalVenta)}
          </p>
        </div>
        <div className="w-56 shrink-0">
          <GuardarVentaButton
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onGuardar={onGuardar}
          />
        </div>
      </div>
    </section>
  )
})
