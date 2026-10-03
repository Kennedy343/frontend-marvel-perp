import { useState, useEffect, useEffectEvent, useRef, memo } from 'react'
import Icon from '../../../components/common/Icon'
import type { Venta, FacturarVentaDto } from '../types/venta'

interface FacturarVentaModalProps {
  isOpen: boolean
  isSubmitting: boolean
  venta: Venta | null
  error: string | null
  onClose: () => void
  onConfirm: (payload: FacturarVentaDto) => Promise<void>
}

export const FacturarVentaModal = memo(function FacturarVentaModal({
  isOpen,
  isSubmitting,
  venta,
  error,
  onClose,
  onConfirm,
}: FacturarVentaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [serieFactura, setSerieFactura] = useState('')
  const [numeroFactura, setNumeroFactura] = useState('')
  const [uuidDte, setUuidDte] = useState('')
  const [formErrors, setFormErrors] = useState<{ serie?: string; numero?: string }>({})
  const [prevOpen, setPrevOpen] = useState(isOpen)

  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen)
    if (isOpen) {
      setSerieFactura(venta?.serieFactura || '')
      setNumeroFactura(venta?.numeroFactura || '')
      setUuidDte(venta?.uuidDte || '')
      setFormErrors({})
    }
  }

  const handleClose = useEffectEvent(() => {
    if (!isSubmitting) onClose()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { serie?: string; numero?: string } = {}
    if (!serieFactura.trim()) errors.serie = 'La serie de factura es obligatoria'
    if (!numeroFactura.trim()) errors.numero = 'El número de factura es obligatorio'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    await onConfirm({
      serieFactura: serieFactura.trim(),
      numeroFactura: numeroFactura.trim(),
      ...(uuidDte.trim() ? { uuidDte: uuidDte.trim() } : {}),
    })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="facturar-venta-title"
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-xl border border-gray-100 bg-white p-0 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5 text-navy-950">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Icon name="icon-check" className="size-4" />
            </div>
            <h2 id="facturar-venta-title" className="font-sora text-base font-semibold">
              Facturar Venta #{venta?.idVenta}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <Icon name="icon-close" className="size-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 font-dm-sans text-sm">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error-red">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="facturar-serie-input"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Serie de Factura *
            </label>
            <input
              id="facturar-serie-input"
              type="text"
              required
              value={serieFactura}
              onChange={(e) => {
                setSerieFactura(e.target.value)
                setFormErrors((prev) => ({ ...prev, serie: undefined }))
              }}
              placeholder="Ej: A, FEL-01…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-navy-950 focus:border-primary-blue focus:outline-none"
            />
            {formErrors.serie && (
              <p className="mt-1 text-xs text-error-red">{formErrors.serie}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="facturar-numero-input"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Número de Factura *
            </label>
            <input
              id="facturar-numero-input"
              type="text"
              required
              value={numeroFactura}
              onChange={(e) => {
                setNumeroFactura(e.target.value)
                setFormErrors((prev) => ({ ...prev, numero: undefined }))
              }}
              placeholder="Ej: 10423…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-navy-950 focus:border-primary-blue focus:outline-none"
            />
            {formErrors.numero && (
              <p className="mt-1 text-xs text-error-red">{formErrors.numero}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="facturar-uuid-input"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              UUID / Autorización SAT / DTE (Opcional)
            </label>
            <input
              id="facturar-uuid-input"
              type="text"
              value={uuidDte}
              onChange={(e) => setUuidDte(e.target.value)}
              placeholder="Ej: 4A5F78B9-1234-5678-ABCD-EF0123456789…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs text-navy-950 focus:border-primary-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-dm-sans text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Facturando…</span>
              </>
            ) : (
              <span>Confirmar Facturación</span>
            )}
          </button>
        </div>
      </form>
    </dialog>
  )
})
