import { memo, useCallback, useId, useState } from 'react'
import Icon from '../../../components/common/Icon'
import {
  PRICE_INPUT_REGEX,
  moneyFormatter,
  round2,
  safeCalculatePrecio,
} from '../utils/precios'
import type {
  DetalleCompraFormData,
  DetalleCompraPatch,
  DetallePrecioMargen,
} from '../types/compra'

interface DetalleCompraEditorProps {
  detalle: DetalleCompraFormData
  disabled: boolean
  onCancel: () => void
  onSave: (patch: DetalleCompraPatch) => void
}

interface DetalleDraft {
  cantidad: string
  precioCostoUnitario: string
  márgenes: DetallePrecioMargen[]
}

const fieldLabelClass =
  'block font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-700'

const inputClass =
  'mt-1.5 w-full rounded-lg border px-3 py-2 font-dm-sans text-sm text-navy-950 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'

const numberInputClass =
  'w-full rounded-md border border-gray-200 bg-white py-1.5 pr-7 pl-2.5 text-right font-dm-sans text-sm text-navy-950 transition-colors focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20'

const actionButtonClass =
  'inline-flex size-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40'

function createDraft(detalle: DetalleCompraFormData): DetalleDraft {
  return {
    cantidad: detalle.cantidad,
    precioCostoUnitario: detalle.precioCostoUnitario,
    márgenes: detalle.márgenes?.map((margen) => ({ ...margen })) ?? [],
  }
}

function isCantidadValida(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) >= 1
}

const DetalleCompraEditor = memo(function DetalleCompraEditor({
  detalle,
  disabled,
  onCancel,
  onSave,
}: DetalleCompraEditorProps) {
  const fieldId = useId()
  const [draft, setDraft] = useState<DetalleDraft>(() => createDraft(detalle))

  const nombreProducto = detalle.producto?.nombreProducto ?? 'Producto desconocido'
  const codigoProducto = detalle.producto?.codigoProducto ?? ''

  const handleMargenChange = useCallback((idTipoPrecio: number, value: string) => {
    setDraft((prev) => ({
      ...prev,
      márgenes: prev.márgenes.map((margen) =>
        margen.idTipoPrecio === idTipoPrecio
          ? { ...margen, porcentajeMargen: value }
          : margen,
      ),
    }))
  }, [])

  const cantidadValida = isCantidadValida(draft.cantidad)
  const costoValido =
    PRICE_INPUT_REGEX.test(draft.precioCostoUnitario) && Number(draft.precioCostoUnitario) > 0
  const margenesCompletos = draft.márgenes.every(
    (margen) => String(margen.porcentajeMargen).trim() !== '',
  )
  const canSave = cantidadValida && costoValido && margenesCompletos

  const subtotalDraft = round2(
    (Number(draft.cantidad) || 0) * (Number(draft.precioCostoUnitario) || 0),
  )

  const handleSave = useCallback(() => {
    onSave({
      cantidad: draft.cantidad,
      precioCostoUnitario: draft.precioCostoUnitario,
      márgenes: draft.márgenes.map((margen) => ({
        ...margen,
        precioVentaCalculado: safeCalculatePrecio(
          draft.precioCostoUnitario,
          margen.porcentajeMargen,
        ),
      })),
    })
  }, [draft, onSave])

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100/70 pb-3">
        <div className="min-w-0">
          {codigoProducto && (
            <p className="font-mono text-[11px] text-gray-500">{codigoProducto}</p>
          )}
          <p className="font-dm-sans text-sm font-semibold text-navy-950">{nombreProducto}</p>
        </div>
        <div className="text-right">
          <span className="block font-dm-sans text-[10px] uppercase tracking-wider text-gray-500">
            Subtotal
          </span>
          <span className="font-sora text-sm font-semibold tabular-nums text-navy-950">
            {moneyFormatter.format(subtotalDraft)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${fieldId}-cantidad`} className={fieldLabelClass}>
            Cantidad
          </label>
          <input
            id={`${fieldId}-cantidad`}
            type="number"
            min={1}
            step={1}
            value={draft.cantidad}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, cantidad: event.target.value }))
            }
            disabled={disabled}
            className={`${inputClass} ${
              cantidadValida
                ? 'border-gray-200 bg-white hover:border-gray-300 focus:border-primary-blue'
                : 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
            }`}
          />
          {!cantidadValida && (
            <p className="mt-1 font-dm-sans text-xs font-medium text-error-red">
              Ingresa una cantidad entera mayor o igual a 1.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${fieldId}-costo`} className={fieldLabelClass}>
            Costo unitario (Factura)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-dm-sans text-xs font-bold text-gray-400">
              Q
            </span>
            <input
              id={`${fieldId}-costo`}
              type="number"
              min={0.01}
              step={0.01}
              value={draft.precioCostoUnitario}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, precioCostoUnitario: event.target.value }))
              }
              disabled={disabled}
              className={`${inputClass} pl-7 ${
                costoValido
                  ? 'border-gray-200 bg-white hover:border-gray-300 focus:border-primary-blue'
                  : 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
              }`}
            />
          </div>
          {!costoValido && (
            <p className="mt-1 font-dm-sans text-xs font-medium text-error-red">
              El costo debe ser mayor a 0, con hasta 2 decimales.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-primary-blue">
          Márgenes y precio de venta
        </p>
        {draft.márgenes.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {draft.márgenes.map((margen) => (
              <div
                key={margen.idTipoPrecio}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <label
                  htmlFor={`${fieldId}-margen-${margen.idTipoPrecio}`}
                  className="block truncate font-dm-sans text-xs font-semibold text-navy-950"
                >
                  {margen.nombreTipoPrecio}
                </label>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="relative w-24">
                    <input
                      id={`${fieldId}-margen-${margen.idTipoPrecio}`}
                      type="number"
                      min={0}
                      step={0.1}
                      value={margen.porcentajeMargen}
                      onChange={(event) =>
                        handleMargenChange(margen.idTipoPrecio, event.target.value)
                      }
                      disabled={disabled}
                      className={`${numberInputClass} ${
                        String(margen.porcentajeMargen).trim() === ''
                          ? 'border-error-red bg-red-50/30 text-error-red'
                          : ''
                      }`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center font-dm-sans text-xs text-gray-400">
                      %
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-dm-sans text-[10px] uppercase tracking-wide text-gray-400">
                      Precio venta
                    </span>
                    <span className="font-sora text-sm font-semibold tabular-nums text-primary-blue">
                      {moneyFormatter.format(
                        safeCalculatePrecio(
                          draft.precioCostoUnitario,
                          margen.porcentajeMargen,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 font-dm-sans text-xs text-gray-500">
            No hay listas de precios activas.
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 border-t border-blue-100/70 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          aria-label={`Cancelar edición de ${nombreProducto}`}
          title="Cancelar"
          className={`${actionButtonClass} border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-navy-950`}
        >
          <Icon name="icon-close" className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || !canSave}
          aria-label={`Guardar cambios de ${nombreProducto}`}
          title="Guardar cambios"
          className={`${actionButtonClass} bg-emerald-600 text-white shadow-soft hover:bg-emerald-700`}
        >
          <Icon name="icon-check" className="size-4.5" />
        </button>
      </div>
    </div>
  )
})

export default DetalleCompraEditor
