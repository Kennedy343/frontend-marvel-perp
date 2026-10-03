import { useEffect, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import { ESTADO_TRASLADO_LABELS } from '../lib/etiquetas'
import type { EstadoTraslado, Traslado } from '../types/traslado'

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

const ESTADO_BADGE_CLASS: Record<EstadoTraslado, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700',
  ENVIADO: 'bg-blue-50 text-primary-blue',
  RECIBIDO: 'bg-emerald-50 text-emerald-700',
  ANULADO: 'bg-gray-100 text-gray-500',
}

function nombreUsuario(
  usuario: { nombreUsuario: string; apellidoUsuario: string } | null,
): string {
  if (!usuario) return '—'
  return `${usuario.nombreUsuario} ${usuario.apellidoUsuario}`.trim() || '—'
}

interface DetalleTrasladoModalProps {
  open: boolean
  traslado: Traslado | null
  isLoading: boolean
  onClose: () => void
}

function DetalleTrasladoModal({
  open,
  traslado,
  isLoading,
  onClose,
}: DetalleTrasladoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

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
      onClose()
    }
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="detalle-traslado-title"
      className="m-auto w-full max-w-3xl rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="detalle-traslado-title"
            className="font-sora text-lg font-semibold text-navy-950"
          >
            Detalle de traslado
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {traslado ? `Traslado #${traslado.idTraslado}` : 'Cargando…'}
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

      {isLoading || !traslado ? (
        <p className="py-12 text-center text-sm text-gray-500">
          Cargando detalle del traslado…
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-4">
            <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-navy-950 shadow-sm">
              {traslado.sucursalOrigen?.nombreSucursal ||
                `#${traslado.idSucursalOrigen}`}
            </span>
            <Icon name="icon-transfer" className="size-4 text-gray-400" />
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary-blue">
              {traslado.sucursalDestino?.nombreSucursal ||
                `#${traslado.idSucursalDestino}`}
            </span>
            <span
              className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                ESTADO_BADGE_CLASS[traslado.estado] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {ESTADO_TRASLADO_LABELS[traslado.estado] ?? traslado.estado}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Solicitado por
              </p>
              <p className="mt-0.5 font-medium text-navy-950">
                {nombreUsuario(traslado.usuarioSolicita)}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(traslado.fechaCreacion)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Enviado por
              </p>
              <p className="mt-0.5 font-medium text-navy-950">
                {nombreUsuario(traslado.usuarioEnvio)}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(traslado.fechaEnvio)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Recibido por
              </p>
              <p className="mt-0.5 font-medium text-navy-950">
                {nombreUsuario(traslado.usuarioRecibe)}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(traslado.fechaRecepcion)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Motivo
              </p>
              <p className="mt-0.5 font-medium text-navy-950">
                {traslado.motivo || '—'}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {traslado.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Este traslado no tiene detalles.
                    </td>
                  </tr>
                ) : (
                  traslado.detalles.map((detalle) => (
                    <tr key={detalle.idDetalleTraslado} className="text-gray-600">
                      <td className="px-4 py-3 font-medium text-navy-950">
                        {detalle.producto?.nombreProducto || 'Producto desconocido'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {detalle.producto?.codigoProducto || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy-950">
                        {detalle.cantidad}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

export default DetalleTrasladoModal
