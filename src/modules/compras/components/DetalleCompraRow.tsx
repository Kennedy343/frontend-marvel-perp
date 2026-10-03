import { memo, useCallback, useState } from 'react'
import Icon from '../../../components/common/Icon'
import DetalleCompraEditor from './DetalleCompraEditor'
import { moneyFormatter, round2 } from '../utils/precios'
import type { DetalleCompraFormData, DetalleCompraPatch } from '../types/compra'

interface DetalleCompraRowProps {
  detalle: DetalleCompraFormData
  disabled: boolean
  onQuitar: (idDetalleTemporal: number) => void
  onUpdateDetalle: (idDetalleTemporal: number, patch: DetalleCompraPatch) => void
}

const cellClass =
  'px-4 py-3 align-middle max-md:flex max-md:items-center max-md:justify-between max-md:gap-4 max-md:border-0 max-md:px-0 max-md:py-1.5'

const cellLabelClass =
  'max-md:before:mr-3 max-md:before:shrink-0 max-md:before:font-dm-sans max-md:before:text-[11px] max-md:before:font-semibold max-md:before:uppercase max-md:before:tracking-wider max-md:before:text-gray-400 max-md:before:content-[attr(data-label)]'

const iconButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg text-gray-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-40'

const DetalleCompraRow = memo(function DetalleCompraRow({
  detalle,
  disabled,
  onQuitar,
  onUpdateDetalle,
}: DetalleCompraRowProps) {
  const [isEditing, setIsEditing] = useState(false)

  const nombreProducto = detalle.producto?.nombreProducto ?? 'Producto desconocido'
  const codigoProducto = detalle.producto?.codigoProducto ?? ''

  const handleSave = useCallback(
    (patch: DetalleCompraPatch) => {
      onUpdateDetalle(detalle.idDetalleTemporal, patch)
      setIsEditing(false)
    },
    [detalle.idDetalleTemporal, onUpdateDetalle],
  )

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  if (isEditing) {
    return (
      <tr className="bg-blue-50/20 max-md:mb-3 max-md:block max-md:last:mb-0">
        <td colSpan={6} className="p-3 sm:p-4 max-md:block max-md:p-0">
          <DetalleCompraEditor
            detalle={detalle}
            disabled={disabled}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </td>
      </tr>
    )
  }

  const cantidad = Number(detalle.cantidad) || 0
  const costo = Number(detalle.precioCostoUnitario) || 0
  const subtotal = round2(cantidad * costo)

  return (
    <tr className="text-gray-600 transition-colors hover:bg-gray-50/50 max-md:mb-3 max-md:block max-md:rounded-xl max-md:border max-md:border-gray-200 max-md:bg-white max-md:p-4 max-md:last:mb-0">
      <td data-label="Producto" className={`${cellClass} ${cellLabelClass}`}>
        <div className="min-w-0 max-md:max-w-[65%] max-md:text-right">
          {codigoProducto && (
            <span className="block font-mono text-[11px] text-gray-400">{codigoProducto}</span>
          )}
          <span className="font-medium text-navy-950">{nombreProducto}</span>
        </div>
      </td>

      <td
        data-label="Cantidad"
        className={`${cellClass} ${cellLabelClass} text-right tabular-nums max-md:w-32`}
      >
        {cantidad}
      </td>

      <td
        data-label="Costo unitario"
        className={`${cellClass} ${cellLabelClass} text-right tabular-nums max-md:w-40`}
      >
        {moneyFormatter.format(costo)}
      </td>

      <td
        data-label="Precios de venta"
        className={`${cellClass} ${cellLabelClass} max-md:items-start`}
      >
        {detalle.márgenes && detalle.márgenes.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-md:justify-end">
            {detalle.márgenes.map((margen) => (
              <span
                key={margen.idTipoPrecio}
                className="inline-flex items-baseline gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500"
              >
                {margen.nombreTipoPrecio}
                <strong className="font-sora text-primary-blue tabular-nums">
                  {moneyFormatter.format(margen.precioVentaCalculado)}
                </strong>
                <span className="text-gray-400">{margen.porcentajeMargen}%</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      <td
        data-label="Subtotal"
        className={`${cellClass} ${cellLabelClass} text-right font-semibold tabular-nums text-navy-950`}
      >
        {moneyFormatter.format(subtotal)}
      </td>

      <td data-label="Acciones" className={`${cellClass} ${cellLabelClass} text-right`}>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            aria-label={`Editar ${nombreProducto}`}
            title="Editar línea"
            className={`${iconButtonClass} hover:bg-blue-50 hover:text-primary-blue`}
          >
            <Icon name="icon-edit" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onQuitar(detalle.idDetalleTemporal)}
            disabled={disabled}
            aria-label={`Quitar ${nombreProducto}`}
            title="Quitar línea"
            className={`${iconButtonClass} text-error-red hover:bg-red-50`}
          >
            <Icon name="icon-trash" className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  )
})

export default DetalleCompraRow
