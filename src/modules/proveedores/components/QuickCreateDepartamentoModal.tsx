import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { isAxiosError } from 'axios'
import Icon from '../../../components/common/Icon'
import { proveedorService } from '../services/proveedorService'
import type { Departamento } from '../types/proveedor'

interface QuickCreateDepartamentoModalProps {
  onClose: () => void
  onSuccess: (created: Departamento) => void
}

const MAX_NOMBRE_LENGTH = 100

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
    hasError
      ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
      : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
  }`

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg) && msg.length > 0) return msg.join('. ')
    if (error.response?.status === 409) {
      return 'Ya existe un departamento con ese nombre.'
    }
  }
  return 'No se pudo registrar el departamento. Intente nuevamente.'
}

export default function QuickCreateDepartamentoModal({
  onClose,
  onSuccess,
}: QuickCreateDepartamentoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const handleChange = (value: string) => {
    setNombre(value)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const limpio = nombre.trim()

    if (!limpio) {
      setError('El nombre del departamento es obligatorio.')
      return
    }
    if (limpio.length > MAX_NOMBRE_LENGTH) {
      setError(`El nombre no debe superar los ${MAX_NOMBRE_LENGTH} caracteres.`)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const created = await proveedorService.createDepartamento(limpio)
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      console.error('Error al crear departamento:', err)
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="quick-create-departamento-title"
      className="m-auto w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-map-pin" className="size-4" />
          </span>
          <h3
            id="quick-create-departamento-title"
            className="font-sora text-base font-semibold text-navy-950"
          >
            Nuevo Departamento
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar modal"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-close" className="size-4" />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error-red"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="quickDepartamentoNombre"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Nombre del departamento <span className="text-error-red">*</span>
          </label>
          <input
            id="quickDepartamentoNombre"
            type="text"
            value={nombre}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={MAX_NOMBRE_LENGTH}
            placeholder="Ej. Guatemala"
            disabled={isSubmitting}
            autoFocus
            className={`mt-1 ${inputClass(Boolean(error))}`}
          />
          <p className="mt-1 text-xs text-gray-400">
            El nuevo departamento quedará seleccionado automáticamente.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 font-dm-sans text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="icon-check" className="size-3.5" />
            <span>{isSubmitting ? 'Guardando…' : 'Guardar y Seleccionar'}</span>
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  )
}
