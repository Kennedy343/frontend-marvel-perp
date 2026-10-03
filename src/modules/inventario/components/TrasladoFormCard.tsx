import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import DraftRestoreBanner from '../../../components/common/DraftRestoreBanner'
import FilterCombobox, {
  type FilterOption,
} from '../../../components/common/FilterCombobox'
import { useCreateTraslado } from '../hooks/useCreateTraslado'
import { getStockEnSucursal } from '../lib/stock'
import type { Producto } from '../types/producto'
import type { TrasladoDetalleFormData } from '../types/traslado'

const labelClass =
  'mb-1 block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-600'

const selectClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 font-dm-sans text-sm text-navy-950 transition-colors focus:border-primary-blue focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400'

const comboboxClass =
  'h-10 w-full rounded-lg border-gray-200 bg-gray-50/50 px-3 font-dm-sans text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20'

function cantidadClass(superaStock: boolean): string {
  return `w-full rounded-lg border bg-gray-50/50 px-3 py-2.5 font-dm-sans text-sm text-navy-950 transition-colors focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
    superaStock
      ? 'border-amber-300 focus:border-amber-500'
      : 'border-gray-200 focus:border-primary-blue'
  }`
}

interface StockCellProps {
  stock: number | null
  origenSeleccionado: boolean
  superaStock: boolean
}

function StockCell({ stock, origenSeleccionado, superaStock }: StockCellProps) {
  const disponible = origenSeleccionado && stock !== null
  const value = disponible ? `${stock} u` : '—'
  const valueClass = !disponible
    ? 'text-gray-400'
    : superaStock || stock === 0
      ? 'text-amber-700'
      : 'text-emerald-700'
  const title = !origenSeleccionado
    ? 'Seleccione la sucursal de origen para ver el stock'
    : stock === null
      ? 'Seleccione un producto para ver el stock'
      : superaStock
        ? 'La cantidad supera el stock disponible en la sucursal de origen'
        : `Stock en la sucursal de origen: ${stock} unidades`

  return (
    <div className="sm:col-span-2">
      <p className={labelClass}>
        <span className="flex items-center gap-1">
          <Icon name="icon-inventory" className="size-3.5" />
          Stock
        </span>
      </p>
      <div
        title={title}
        className={`flex items-center justify-center rounded-lg border px-3 py-2.5 ${
          superaStock
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-gray-200 bg-gray-50/50'
        }`}
      >
        <span className={`font-sora text-sm font-semibold ${valueClass}`}>
          {value}
        </span>
      </div>
    </div>
  )
}

interface TrasladoDetalleRowProps {
  detalle: TrasladoDetalleFormData
  index: number
  resultados: Producto[]
  selectedProducto?: Producto
  isSearching: boolean
  stock: number | null
  origenSeleccionado: boolean
  disabled: boolean
  hasError: boolean
  onSearchChange: (value: string) => void
  onSelectProducto: (idDetalleTemporal: number, idProducto: number) => void
  onClearProducto: (idDetalleTemporal: number) => void
  onUpdate: (
    idDetalleTemporal: number,
    patch: Partial<TrasladoDetalleFormData>,
  ) => void
  onRemove: (idDetalleTemporal: number) => void
}

const TrasladoDetalleRow = memo(function TrasladoDetalleRow({
  detalle,
  index,
  resultados,
  selectedProducto,
  isSearching,
  stock,
  origenSeleccionado,
  disabled,
  hasError,
  onSearchChange,
  onSelectProducto,
  onClearProducto,
  onUpdate,
  onRemove,
}: TrasladoDetalleRowProps) {
  const cantidad = Number(detalle.cantidad)
  const cantidadInvalida =
    detalle.cantidad.trim() === '' || Number.isNaN(cantidad) || cantidad <= 0
  const superaStock = stock !== null && !cantidadInvalida && cantidad > stock

  const productoOptions = useMemo<FilterOption[]>(() => {
    const productos = selectedProducto
      ? [
          selectedProducto,
          ...resultados.filter((p) => p.idProducto !== selectedProducto.idProducto),
        ]
      : resultados
    return productos.map((p) => ({
      value: p.idProducto,
      label: `${p.codigoProducto} — ${p.nombreProducto}`,
    }))
  }, [resultados, selectedProducto])

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-3 sm:grid-cols-12 sm:items-start">
      <div className="sm:col-span-7">
        <label
          htmlFor={`traslado-producto-${detalle.idDetalleTemporal}`}
          className={labelClass}
        >
          Producto {index + 1}
        </label>
        <FilterCombobox
          id={`traslado-producto-${detalle.idDetalleTemporal}`}
          searchable
          remoteSearch
          ariaLabel={`Producto ${index + 1}`}
          placeholder="Buscar por código o nombre…"
          emptyLabel="No se encontró ningún producto."
          searchHint="Escriba al menos 3 caracteres para buscar…"
          minSearchLength={3}
          isSearching={isSearching}
          onSearchChange={onSearchChange}
          items={productoOptions}
          value={detalle.idProducto ? Number(detalle.idProducto) : undefined}
          onChange={(id) => {
            if (id == null) {
              onClearProducto(detalle.idDetalleTemporal)
            } else {
              onSelectProducto(detalle.idDetalleTemporal, id)
            }
          }}
          disabled={disabled}
          invalid={hasError}
          className={comboboxClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={`traslado-cantidad-${detalle.idDetalleTemporal}`}
          className={labelClass}
        >
          Cantidad
        </label>
        <input
          id={`traslado-cantidad-${detalle.idDetalleTemporal}`}
          type="number"
          min={1}
          step={1}
          value={detalle.cantidad}
          onChange={(e) =>
            onUpdate(detalle.idDetalleTemporal, { cantidad: e.target.value })
          }
          disabled={disabled}
          aria-invalid={superaStock}
          className={cantidadClass(superaStock)}
        />
      </div>

      <StockCell
        stock={stock}
        origenSeleccionado={origenSeleccionado}
        superaStock={superaStock}
      />

      <div className="sm:col-span-1">
        <button
          type="button"
          onClick={() => onRemove(detalle.idDetalleTemporal)}
          disabled={disabled}
          title="Quitar producto"
          aria-label="Quitar producto"
          className="mt-5 inline-flex size-10 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 text-error-red transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="icon-trash" className="size-4" />
        </button>
      </div>
    </div>
  )
})

export default function TrasladoFormCard() {
  const navigate = useNavigate()
  const {
    form,
    errors,
    setField,
    addDetalle,
    updateDetalle,
    removeDetalle,
    selectProducto,
    clearProducto,
    sucursales,
    productoResultados,
    setProductoSearchTerm,
    isSearchingProductos,
    isLoadingCatalogs,
    isSubmitting,
    submitError,
    draftRestoredAt,
    discardDraft,
    submit,
  } = useCreateTraslado()

  const idSucursalOrigen = form.idSucursalOrigen
    ? Number(form.idSucursalOrigen)
    : null

  const sucursalOptions = useMemo<FilterOption[]>(
    () =>
      sucursales.map((s) => ({
        value: s.idSucursal,
        label: s.nombreSucursal,
      })),
    [sucursales],
  )

  const sucursalDestinoOptions = useMemo<FilterOption[]>(
    () =>
      sucursales
        .filter((s) => String(s.idSucursal) !== form.idSucursalOrigen)
        .map((s) => ({
          value: s.idSucursal,
          label: s.nombreSucursal,
        })),
    [sucursales, form.idSucursalOrigen],
  )

  const handleOrigenChange = (id: number | undefined) => {
    const next = id != null ? String(id) : ''
    setField('idSucursalOrigen', next)
    if (next && next === form.idSucursalDestino) {
      setField('idSucursalDestino', '')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const nombreOrigen = sucursales.find(
      (s) => String(s.idSucursal) === form.idSucursalOrigen,
    )?.nombreSucursal
    const nombreDestino = sucursales.find(
      (s) => String(s.idSucursal) === form.idSucursalDestino,
    )?.nombreSucursal

    const cantidad = form.detalles.length
    const descripcion =
      nombreOrigen && nombreDestino
        ? `${nombreOrigen} → ${nombreDestino} · ${cantidad} producto${cantidad === 1 ? '' : 's'}.`
        : 'El traslado fue registrado correctamente.'

    toast
      .promise(
        (async () => {
          const creado = await submit()
          if (!creado) throw new Error('create-failed')
          return creado
        })(),
        {
          id: 'create-traslado',
          loading: 'Registrando traslado…',
          success: {
            message: 'Traslado creado',
            description: descripcion,
          },
          error: {
            message: 'No se pudo registrar el traslado',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/inventario/traslados'))
      .catch(() => {})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {draftRestoredAt != null && (
        <DraftRestoreBanner savedAt={draftRestoredAt} onDiscard={discardDraft} />
      )}

      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-card">
        <h2 className="font-sora text-base font-semibold text-navy-950">
          Datos del traslado
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="traslado-origen" className={labelClass}>
              Sucursal de origen
            </label>
            <FilterCombobox
              id="traslado-origen"
              ariaLabel="Sucursal de origen"
              placeholder="Seleccione una sucursal…"
              emptyLabel="No se encontraron sucursales."
              items={sucursalOptions}
              value={
                form.idSucursalOrigen
                  ? Number(form.idSucursalOrigen)
                  : undefined
              }
              onChange={handleOrigenChange}
              disabled={isLoadingCatalogs || isSubmitting}
              invalid={Boolean(errors.idSucursalOrigen)}
              className={comboboxClass}
            />
            {errors.idSucursalOrigen && (
              <p className="mt-1 text-xs font-medium text-error-red">
                {errors.idSucursalOrigen}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="traslado-destino" className={labelClass}>
              Sucursal de destino
            </label>
            <FilterCombobox
              id="traslado-destino"
              ariaLabel="Sucursal de destino"
              placeholder="Seleccione una sucursal…"
              emptyLabel="No se encontraron sucursales."
              items={sucursalDestinoOptions}
              value={
                form.idSucursalDestino
                  ? Number(form.idSucursalDestino)
                  : undefined
              }
              onChange={(id) =>
                setField('idSucursalDestino', id != null ? String(id) : '')
              }
              disabled={isLoadingCatalogs || isSubmitting}
              invalid={Boolean(errors.idSucursalDestino)}
              className={comboboxClass}
            />
            {errors.idSucursalDestino && (
              <p className="mt-1 text-xs font-medium text-error-red">
                {errors.idSucursalDestino}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="traslado-motivo" className={labelClass}>
              Motivo <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="traslado-motivo"
              type="text"
              value={form.motivo}
              onChange={(e) => setField('motivo', e.target.value)}
              maxLength={255}
              disabled={isSubmitting}
              placeholder="Motivo o referencia del traslado…"
              className={selectClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-sora text-base font-semibold text-navy-950">Productos</h2>
          <button
            type="button"
            onClick={addDetalle}
            disabled={isLoadingCatalogs || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-dm-sans text-sm font-medium text-navy-950 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="icon-plus" className="size-4" />
            <span>Agregar producto</span>
          </button>
        </div>

        {form.detalles.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 py-10 text-center font-dm-sans text-sm text-gray-400">
            Aún no ha agregado productos al traslado.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {form.detalles.map((detalle, index) => (
              <TrasladoDetalleRow
                key={detalle.idDetalleTemporal}
                detalle={detalle}
                index={index}
                resultados={productoResultados}
                selectedProducto={detalle.producto}
                isSearching={isSearchingProductos}
                stock={getStockEnSucursal(detalle.producto, idSucursalOrigen)}
                origenSeleccionado={idSucursalOrigen !== null}
                disabled={isSubmitting}
                hasError={Boolean(errors.detalles) && !detalle.idProducto}
                onSearchChange={setProductoSearchTerm}
                onSelectProducto={selectProducto}
                onClearProducto={clearProducto}
                onUpdate={updateDetalle}
                onRemove={removeDetalle}
              />
            ))}
          </div>
        )}

        {errors.detalles && (
          <p className="mt-3 text-xs font-medium text-error-red">{errors.detalles}</p>
        )}
      </section>

      {submitError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-error-red"
        >
          {submitError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate('/inventario/traslados')}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingCatalogs}
          className="inline-flex items-center justify-center rounded-lg bg-navy-950 px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creando traslado…' : 'Crear traslado'}
        </button>
      </div>
    </form>
  )
}
