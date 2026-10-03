import { useEffect, useEffectEvent, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import type { Compra } from '../types/compra'

interface AnularCompraModalProps {
  open: boolean
  compra: Compra | null
  isLoading: boolean
  error: string | null
  motivo: string
  onMotivoChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

function AnularCompraModal({
  open,
  compra,
  isLoading,
  error,
  motivo,
  onMotivoChange,
  onConfirm,
  onClose,
}: AnularCompraModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = useEffectEvent(() => {
    if (!isLoading) onClose()
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

  const disabled = !motivo.trim()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="anular-compra-title"
      className="m-auto w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-error-red">
          <Icon name="icon-trash" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="anular-compra-title" className="font-sora text-lg font-semibold text-navy-950">
            Anular compra
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            ¿Estás seguro de que deseas anular la compra{' '}
            {compra ? `${compra.serieFactura} - ${compra.numeroFactura}` : ''}? Esta acción no se
            puede deshacer.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="motivoAnulacion"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
        >
          Motivo de anulación <span className="text-error-red">*</span>
        </label>
        <textarea
          id="motivoAnulacion"
          name="motivoAnulacion"
          value={motivo}
          onChange={(e) => onMotivoChange(e.target.value)}
          disabled={isLoading}
          maxLength={255}
          rows={3}
          placeholder="Describa el motivo de la anulación…"
          className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            error
              ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
              : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
          }`}
        />
        {error ? (
          <p className="mt-1 text-xs font-medium text-error-red">{error}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">{motivo.length}/255</p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled || isLoading}
          className="inline-flex items-center justify-center rounded-lg bg-error-red px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Anulando…' : 'Anular Compra'}
        </button>
      </div>
    </dialog>
  )
}

export default AnularCompraModal