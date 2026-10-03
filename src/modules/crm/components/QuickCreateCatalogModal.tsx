import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { isAxiosError } from 'axios'
import Icon from '../../../components/common/Icon'
import { clientService } from '../services/clientService'
import { CATALOGO_META, type CatalogoKind } from '../lib/catalogos'

interface QuickCreateCatalogModalProps {
  kind: CatalogoKind
  parentId?: number
  onClose: () => void
  onSuccess: (kind: CatalogoKind, created: unknown) => void
}

const MAX_NOMBRE_LENGTH = 100

function createCatalogo(kind: CatalogoKind, nombre: string, parentId?: number): Promise<unknown> {
  switch (kind) {
    case 'departamento':
      return clientService.createDepartamento(nombre)
    case 'municipio':
      if (parentId === undefined) return Promise.reject(new Error('missing-parent'))
      return clientService.createMunicipio(nombre, parentId)
    case 'comunidad':
      if (parentId === undefined) return Promise.reject(new Error('missing-parent'))
      return clientService.createComunidad(nombre, parentId)
    case 'sector':
      return clientService.createSector(nombre)
    case 'categoria':
      return clientService.createCategoria(nombre)
  }
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg) && msg.length > 0) return msg.join('. ')
    if (error.response?.status === 409) return 'Ya existe un registro con ese nombre.'
    if (error.response?.status === 403) return 'No tienes permisos para crear este catálogo.'
  }
  return 'No se pudo registrar el registro. Intenta nuevamente.'
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
    hasError
      ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
      : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
  }`

function QuickCreateCatalogModal({
  kind,
  parentId,
  onClose,
  onSuccess,
}: QuickCreateCatalogModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const meta = CATALOGO_META[kind]

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const limpio = nombre.trim()
    if (!limpio) {
      setError(`El nombre de ${meta.fieldLabel.toLowerCase()} es obligatorio.`)
      return
    }
    if (limpio.length > MAX_NOMBRE_LENGTH) {
      setError(`El nombre no debe superar los ${MAX_NOMBRE_LENGTH} caracteres.`)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const created = await createCatalogo(kind, limpio, parentId)
      onSuccess(kind, created)
      onClose()
    } catch (err: unknown) {
      console.error(`Error al crear ${kind}:`, err)
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="quick-create-catalogo-title"
      className="m-auto w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name={meta.icon} className="size-4" />
          </span>
          <h3 id="quick-create-catalogo-title" className="font-sora text-base font-semibold text-navy-950">
            {meta.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar modal"
          className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-close" className="size-4" />
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error-red"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div>
          <label
            htmlFor="quickCatalogoNombre"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            {meta.fieldLabel} <span className="text-error-red">*</span>
          </label>
          <input
            id="quickCatalogoNombre"
            type="text"
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value)
              setError(null)
            }}
            maxLength={MAX_NOMBRE_LENGTH}
            placeholder={meta.placeholder}
            disabled={isSubmitting}
            autoFocus
            className={`mt-1 ${inputClass(Boolean(error))}`}
          />
          <p className="mt-1 text-xs text-gray-400">{meta.helpText}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 font-dm-sans text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default QuickCreateCatalogModal
