import { useEffect, useEffectEvent, useRef } from 'react'
import Icon from './Icon'

interface DeleteConfirmationModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmationModal({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = useEffectEvent(() => {
    if (!isLoading) onCancel()
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

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-confirmation-title"
      className="m-auto w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-error-red">
          <Icon name="icon-trash" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id="delete-confirmation-title" className="font-sora text-lg font-semibold text-navy-950">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">{message}</p>
          <p className="mt-1.5 text-sm font-medium text-gray-700">
            Esta acción no se puede deshacer.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-lg bg-error-red px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Eliminando…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default DeleteConfirmationModal