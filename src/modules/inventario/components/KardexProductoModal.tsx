import { useEffect, useMemo, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import { ORIGEN_MOVIMIENTO_LABELS } from '../lib/etiquetas'
import type { MovimientoInventario } from '../types/movimiento'

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

interface KardexProductoModalProps {
  open: boolean
  productoNombre?: string
  productoCodigo?: string
  movimientos: MovimientoInventario[]
  isLoading: boolean
  error: string | null
  onClose: () => void
}

function KardexProductoModal({
  open,
  productoNombre,
  productoCodigo,
  movimientos,
  isLoading,
  error,
  onClose,
}: KardexProductoModalProps) {
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

  const grupos = useMemo(() => {
    const map = new Map<
      number,
      { idSucursal: number; nombre: string; movimientos: MovimientoInventario[] }
    >()
    for (const mov of movimientos) {
      const entry = map.get(mov.idSucursal)
      if (entry) {
        entry.movimientos.push(mov)
      } else {
        map.set(mov.idSucursal, {
          idSucursal: mov.idSucursal,
          nombre: mov.sucursal?.nombreSucursal ?? `Sucursal #${mov.idSucursal}`,
          movimientos: [mov],
        })
      }
    }
    return [...map.values()]
  }, [movimientos])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="kardex-producto-title"
      className="m-auto w-full max-w-4xl rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2
            id="kardex-producto-title"
            className="font-sora text-lg font-semibold text-navy-950"
          >
            Kardex del producto
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {productoCodigo ? `${productoCodigo} — ` : ''}
            {productoNombre || 'Historial de movimientos'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar kardex"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icon name="icon-close" className="size-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
            <span>Cargando kardex…</span>
          </div>
        </div>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-8 text-center text-sm font-medium text-error-red"
        >
          {error}
        </p>
      ) : grupos.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          Este producto no tiene movimientos registrados.
        </p>
      ) : (
        <div className="mt-5 max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          {grupos.map((grupo) => (
            <section key={grupo.idSucursal}>
              <div className="mb-2 flex items-center gap-2">
                <Icon name="icon-map-pin" className="size-4 text-primary-blue" />
                <h3 className="font-sora text-sm font-semibold text-navy-950">
                  {grupo.nombre}
                </h3>
                <span className="font-dm-sans text-xs text-gray-400">
                  {grupo.movimientos.length} movimiento
                  {grupo.movimientos.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/60 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-center">Tipo</th>
                      <th className="px-4 py-3">Origen</th>
                      <th className="px-4 py-3 text-right">Cantidad</th>
                      <th className="px-4 py-3 text-right">Saldo</th>
                      <th className="px-4 py-3">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grupo.movimientos.map((mov) => {
                      const esEntrada = mov.tipo === 'ENTRADA'
                      return (
                        <tr key={mov.idMovimiento} className="text-gray-600">
                          <td className="whitespace-nowrap px-4 py-3 text-xs">
                            {formatDate(mov.fecha)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                esEntrada
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-error-red'
                              }`}
                            >
                              {esEntrada ? 'Entrada' : 'Salida'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {ORIGEN_MOVIMIENTO_LABELS[mov.origen] ?? mov.origen}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-semibold tabular-nums ${
                              esEntrada ? 'text-emerald-700' : 'text-error-red'
                            }`}
                          >
                            {esEntrada ? '+' : '−'}
                            {mov.cantidad}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-xs tabular-nums">
                            {mov.saldoAnterior} → {mov.saldoNuevo}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {`${mov.usuario?.nombreUsuario ?? ''} ${
                              mov.usuario?.apellidoUsuario ?? ''
                            }`.trim() || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
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
    </dialog>
  )
}

export default KardexProductoModal
