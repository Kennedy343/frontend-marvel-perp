import { useState } from 'react'
import Icon from '../../../components/common/Icon'
import ProductoCombobox from './ProductoCombobox'
import QuickCreateProductoModal from './QuickCreateProductoModal'
import DetallesCompraTable from './DetallesCompraTable'
import { moneyFormatter, round2 } from '../utils/precios'
import type { Producto } from '../../inventario/types/producto'
import type {
  CompraProducto,
  DetalleCompraFormData,
  DetalleCompraFormErrors,
  DetalleCompraPatch,
} from '../types/compra'

interface DetalleCompraCardProps {
  productos: CompraProducto[]
  detalles: DetalleCompraFormData[]
  detalleInput: DetalleCompraFormData
  errors: DetalleCompraFormErrors
  isLoadingCatalogs: boolean
  isSearchingProductos: boolean
  onProductoChange: (producto: CompraProducto | null, esNuevo?: boolean) => void
  onProductoSearch: (value: string) => void
  onProductoCreated?: (producto: CompraProducto) => void
  onInputChange: (field: keyof Omit<DetalleCompraFormData, 'idDetalleTemporal' | 'márgenes' | 'producto'>, value: string) => void
  onMargenChange: (idTipoPrecio: number, nuevoMargen: string) => void
  onAgregar: () => void
  onQuitar: (idDetalleTemporal: number) => void
  onUpdateDetalle: (idDetalleTemporal: number, patch: DetalleCompraPatch) => void
  disabled?: boolean
}

function fieldClass(hasError: boolean) {
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
    hasError
      ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
      : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
  }`
}

export default function DetalleCompraCard({
  productos,
  detalles,
  detalleInput,
  errors,
  isLoadingCatalogs,
  isSearchingProductos,
  onProductoChange,
  onProductoSearch,
  onProductoCreated,
  onInputChange,
  onMargenChange,
  onAgregar,
  onQuitar,
  onUpdateDetalle,
  disabled = false,
}: DetalleCompraCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialQuery, setModalInitialQuery] = useState('')

  const totalGeneral = detalles.reduce<number>((acc, d) => {
    const cantidad = Number(d.cantidad) || 0
    const precio = Number(d.precioCostoUnitario) || 0
    return round2(acc + cantidad * precio)
  }, 0)

  const handleOpenCreate = (query?: string) => {
    setModalInitialQuery(query || '')
    setIsModalOpen(true)
  }

  const handleQuickCreated = (created: Producto) => {
    const adapted: CompraProducto = {
      idProducto: created.idProducto,
      codigoProducto: created.codigoProducto,
      nombreProducto: created.nombreProducto,
      ultimoCosto: Number(created.ultimoCosto) || 0,
    }
    if (onProductoCreated) {
      onProductoCreated(adapted)
    }
    onProductoChange(adapted, true)
  }

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-sora text-base font-semibold text-navy-950">
            Detalle de la Compra y Fijación de Precios
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Busque por código o nombre, ingrese el costo de factura y configure los márgenes de ganancia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenCreate()}
          disabled={disabled || isLoadingCatalogs}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-primary-blue/30 bg-blue-50/70 px-3 py-1.5 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-100/70 focus-visible:outline-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="icon-plus" className="size-3.5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <label htmlFor="detalleProducto" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Producto <span className="text-error-red">*</span>
          </label>
          <ProductoCombobox
            id="detalleProducto"
            productos={productos}
            selectedProducto={detalleInput.producto ?? null}
            onSelect={onProductoChange}
            onSearchChange={onProductoSearch}
            onOpenCreate={handleOpenCreate}
            isSearching={isSearchingProductos}
            disabled={disabled}
            hasError={Boolean(errors.idProducto)}
          />
          {errors.idProducto && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.idProducto}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="detalleCantidad"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Cantidad <span className="text-error-red">*</span>
          </label>
          <input
            id="detalleCantidad"
            name="detalleCantidad"
            type="number"
            min={1}
            step={1}
            value={detalleInput.cantidad}
            onChange={(e) => onInputChange('cantidad', e.target.value)}
            disabled={disabled}
            placeholder="Ej. 10"
            className={`mt-1.5 ${fieldClass(Boolean(errors.cantidad))}`}
          />
          {errors.cantidad && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.cantidad}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="detallePrecio"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Costo Unitario (Factura) <span className="text-error-red">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-gray-400">
              Q
            </span>
            <input
              id="detallePrecio"
              name="detallePrecio"
              type="number"
              min={0.01}
              step={0.01}
              value={detalleInput.precioCostoUnitario}
              onChange={(e) => onInputChange('precioCostoUnitario', e.target.value)}
              disabled={disabled}
              placeholder="0.00"
              className={`pl-8 ${fieldClass(Boolean(errors.precioCostoUnitario))}`}
            />
          </div>
          {errors.precioCostoUnitario && (
            <p className="mt-1 text-xs font-medium text-error-red">
              {errors.precioCostoUnitario}
            </p>
          )}
        </div>
      </div>

      {/* Subsección de Márgenes y Precios Calculados */}
      {detalleInput.idProducto && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-blue">
            <Icon name="icon-price-circle" className="size-4" />
            <span>Márgenes y Precios de Venta para este Producto</span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {detalleInput.márgenes && detalleInput.márgenes.length > 0 ? (
              detalleInput.márgenes.map((margen) => (
                <div
                  key={margen.idTipoPrecio}
                  className="rounded-lg border border-gray-200/80 bg-white p-3 shadow-xs"
                >
                  <label htmlFor={`margen-${margen.idTipoPrecio}`} className="text-xs font-bold text-navy-950">
                    {margen.nombreTipoPrecio}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id={`margen-${margen.idTipoPrecio}`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={margen.porcentajeMargen}
                        onChange={(e) => onMargenChange(margen.idTipoPrecio, e.target.value)}
                        disabled={disabled}
                        placeholder="30"
                        className="w-full rounded-md border border-gray-200 py-1.5 pr-6 pl-2.5 text-xs text-navy-950 focus:border-primary-blue focus:outline-none"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-xs text-gray-400">
                        %
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase text-gray-400">Precio Venta</span>
                      <span className="font-sora text-xs font-semibold tabular-nums text-primary-blue">
                        {moneyFormatter.format(margen.precioVentaCalculado)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No hay listas de precios activas.</p>
            )}
          </div>
          {errors.márgenes && (
            <p className="mt-2 text-xs font-medium text-error-red">{errors.márgenes}</p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAgregar}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-5 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="icon-plus" className="size-4" />
          <span>Agregar Ítem a la Compra</span>
        </button>
      </div>

      <DetallesCompraTable
        detalles={detalles}
        disabled={disabled}
        onQuitar={onQuitar}
        onUpdateDetalle={onUpdateDetalle}
      />

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <span className="text-sm font-medium text-gray-500">Total General</span>
        <span className="font-sora text-2xl font-semibold tabular-nums tracking-tight text-navy-950">
          {moneyFormatter.format(totalGeneral)}
        </span>
      </div>

      <QuickCreateProductoModal
        open={isModalOpen}
        initialNameOrCode={modalInitialQuery}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleQuickCreated}
      />
    </section>
  )
}
