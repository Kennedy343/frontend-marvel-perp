import { useEffect, useEffectEvent, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import { formatFecha, formatHora } from '../utils/fecha'
import type { Compra } from '../types/compra'

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

interface DetalleCompraModalProps {
  open: boolean
  compra: Compra | null
  isLoading: boolean
  onClose: () => void
}

function DetalleCompraModal({
  open,
  compra,
  isLoading,
  onClose,
}: DetalleCompraModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = useEffectEvent(() => {
    onClose()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

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

  const totalDetalles = (compra?.detalles ?? []).reduce<number>(
    (acc, d) => round2(acc + d.subtotal),
    0,
  )

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="detalle-compra-title"
      className="m-auto w-full max-w-3xl rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="detalle-compra-title" className="font-sora text-lg font-semibold text-navy-950">
            Detalle de Compra
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {compra ? `${compra.serieFactura} - ${compra.numeroFactura}` : 'Cargando…'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cerrar detalle"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="icon-close" className="size-5" />
        </button>
      </div>

      {isLoading || !compra ? (
        <p className="py-12 text-center text-sm text-gray-500">Cargando detalle de la compra…</p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Proveedor</p>
              <p className="mt-0.5 font-medium text-navy-950">{compra.proveedor?.nombreProveedor || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sucursal</p>
              <p className="mt-0.5 font-medium text-navy-950">{compra.sucursal?.nombreSucursal || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha</p>
              <div className="mt-0.5 font-medium text-navy-950">
                <span className="block">{formatFecha(compra.fechaCompra)}</span>
                <span className="block text-xs font-normal text-gray-500">
                  {formatHora(compra.fechaCompra)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Estado</p>
              <p className="mt-0.5 font-medium text-navy-950">
                {compra.compraActiva ? 'Activa' : 'Anulada'}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Costo Unitario</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {compra.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Esta compra no tiene detalles.
                    </td>
                  </tr>
                ) : (
                  compra.detalles.map((detalle) => (
                    <tr key={detalle.idDetalleCompra} className="text-gray-600">
                      <td className="px-4 py-3 font-medium text-navy-950">
                        {detalle.producto?.nombreProducto || 'Producto desconocido'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        {detalle.cantidad}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        {formatMoney(detalle.precioCostoUnitario)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-navy-950">
                        {formatMoney(detalle.subtotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total de líneas
              </p>
              <p className="text-sm text-gray-500">{formatMoney(totalDetalles)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Compra
              </p>
              <p className="font-sora text-2xl font-semibold tabular-nums tracking-tight text-navy-950">
                {formatMoney(compra.totalCompra)}
              </p>
            </div>
          </div>

          {compra.motivoAnulacion && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-error-red">
                Motivo de anulación
              </p>
              <p className="mt-1 text-gray-700">{compra.motivoAnulacion}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
            >
              Cerrar
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}

export default DetalleCompraModal