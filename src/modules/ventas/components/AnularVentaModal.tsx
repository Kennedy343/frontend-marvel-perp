import { useState, useEffect, useEffectEvent, useRef, memo } from 'react'
import Icon from '../../../components/common/Icon'
import type { Venta, AnularVentaDto } from '../types/venta'

interface AnularVentaModalProps {
  isOpen: boolean
  isSubmitting: boolean
  venta: Venta | null
  error: string | null
  onClose: () => void
  onConfirm: (payload: AnularVentaDto) => Promise<void>
}

export const AnularVentaModal = memo(function AnularVentaModal({
  isOpen,
  isSubmitting,
  venta,
  error,
  onClose,
  onConfirm,
}: AnularVentaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [motivo, setMotivo] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

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
    if (!motivo.trim()) {
      setFormError('Debe ingresar un motivo de anulación.')
      return
    }

    await onConfirm({ motivoAnulacion: motivo.trim() })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="anular-venta-title"
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-xl border border-gray-100 bg-white p-0 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5 text-navy-950">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-error-red">
              <Icon name="icon-close" className="size-4" />
            </div>
            <h2 id="anular-venta-title" className="font-sora text-base font-semibold">
              Anular Venta #{venta?.idVenta}
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
          <p className="text-gray-600">
            ¿Está seguro de anular esta venta? Esta acción devolverá automáticamente las cantidades al stock de la sucursal.
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error-red">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="anular-motivo-textarea"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600"
            >
              Motivo de anulación *
            </label>
            <textarea
              id="anular-motivo-textarea"
              required
              rows={3}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                setFormError(null)
              }}
              placeholder="Explique la razón de la anulación (devolución, error de facturación, etc.)…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-navy-950 focus:border-primary-blue focus:outline-none"
            />
            {formError && (
              <p className="mt-1 text-xs text-error-red">{formError}</p>
            )}
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-error-red px-4 py-2 font-dm-sans text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Anulando…</span>
              </>
            ) : (
              <span>Confirmar Anulación</span>
            )}
          </button>
        </div>
      </form>
    </dialog>
  )
})
