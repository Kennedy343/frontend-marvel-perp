import { useEffect, useEffectEvent, useRef, memo } from 'react'
import Icon from '../../../components/common/Icon'
import type { Venta } from '../types/venta'

interface DetalleVentaModalProps {
  isOpen: boolean
  isLoading: boolean
  venta: Venta | null
  onClose: () => void
  onOpenFacturar?: (venta: Venta) => void
  onOpenAnular?: (venta: Venta) => void
}

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (val: number | string): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return moneyFormatter.format(isNaN(num) ? 0 : num)
}

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

export const DetalleVentaModal = memo(function DetalleVentaModal({
  isOpen,
  isLoading,
  venta,
  onClose,
  onOpenFacturar,
  onOpenAnular,
}: DetalleVentaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = useEffectEvent(() => {
    onClose()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      handleClose()
    }
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) handleClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  const clientName = venta?.cliente
    ? `${venta.cliente.primerNombre} ${venta.cliente.segundoNombre || ''} ${venta.cliente.primerApellido} ${venta.cliente.segundoApellido || ''}`.replace(/\s+/g, ' ').trim()
    : 'Consumidor Final'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="detalle-venta-title"
      className="fixed inset-0 z-50 m-auto w-full max-w-3xl rounded-xl border border-gray-100 bg-white p-0 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 id="detalle-venta-title" className="font-sora text-lg font-semibold text-navy-950">
            Detalle de Venta #{venta?.idVenta}
          </h2>
          <p className="font-dm-sans text-xs text-gray-500">
            {venta?.serieFactura && venta?.numeroFactura
              ? `Factura: ${venta.serieFactura}-${venta.numeroFactura}`
              : 'Venta registrada sin facturar'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Cerrar modal"
        >
          <Icon name="icon-close" className="size-5" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="size-5 animate-spin rounded-full border-2 border-primary-blue border-t-transparent mr-2" />
            <span>Cargando detalle…</span>
          </div>
        ) : !venta ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No se encontró la información de la venta.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Resumen Cabecera */}
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50/75 p-4 text-xs sm:grid-cols-4">
              <div>
                <p className="font-semibold uppercase tracking-wider text-gray-400">
                  Cliente
                </p>
                <p className="mt-1 font-medium text-navy-950">{clientName}</p>
                {venta.cliente?.nit && (
                  <p className="text-gray-500">NIT: {venta.cliente.nit}</p>
                )}
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-gray-400">
                  Sucursal
                </p>
                <p className="mt-1 font-medium text-navy-950">
                  {venta.sucursal?.nombreSucursal || `Sucursal #${venta.idSucursal}`}
                </p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-gray-400">
                  Fecha Venta
                </p>
                <p className="mt-1 font-medium text-navy-950">
                  {formatDate(venta.fechaVenta)}
                </p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-gray-400">
                  Estado
                </p>
                <div className="mt-1">
                  {!venta.ventaActiva ? (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-error-red">
                      Anulada
                    </span>
                  ) : venta.facturada ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Facturada
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Sin Facturar
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Si está anulada, mostrar motivo */}
            {!venta.ventaActiva && venta.motivoAnulacion && (
              <div className="rounded-lg border border-red-200 bg-red-50/60 p-3.5 text-xs text-error-red">
                <p className="font-semibold">Motivo de anulación:</p>
                <p className="mt-0.5">{venta.motivoAnulacion}</p>
              </div>
            )}

            {/* Tabla de Productos / Detalles */}
            <div>
              <h3 className="mb-2 font-sora text-sm font-semibold text-navy-950">
                Productos Vendidos
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-left font-dm-sans text-xs">
                  <thead className="border-b border-gray-100 bg-gray-50/75 uppercase tracking-wider text-gray-500">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">
                        Producto
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Tipo Precio
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Cantidad
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Precio Unit.
                      </th>
                      <th scope="col" className="px-4 py-2.5 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {venta.detalles && venta.detalles.length > 0 ? (
                      venta.detalles.map((det) => (
                        <tr key={det.idDetalleVenta} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-navy-950">
                              {det.producto?.nombreProducto || `Producto #${det.idProducto}`}
                            </p>
                            <p className="font-mono text-[11px] text-gray-400">
                              {det.producto?.codigoProducto}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">
                            {det.tipoPrecio?.nombreTipoPrecio || '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-navy-950">
                            {det.cantidad}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-gray-600">
                            {formatCurrency(det.precioVenta)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-medium text-navy-950">
                            {formatCurrency(det.subtotal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                          Sin detalles registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="border-t border-gray-200 bg-gray-50/50 font-semibold text-navy-950">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right">
                        Total de la Venta:
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-primary-blue">
                        {formatCurrency(venta.totalVenta)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3.5">
        <div className="flex items-center gap-2">
          {venta && venta.ventaActiva && !venta.facturada && onOpenFacturar && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenFacturar(venta)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-dm-sans text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Icon name="icon-check" className="size-3.5" />
              <span>Facturar Venta</span>
            </button>
          )}

          {venta && venta.ventaActiva && onOpenAnular && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenAnular(venta)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 font-dm-sans text-xs font-semibold text-error-red transition-colors hover:bg-red-50"
            >
              <Icon name="icon-close" className="size-3.5" />
              <span>Anular Venta</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar
        </button>
      </div>
    </dialog>
  )
})
