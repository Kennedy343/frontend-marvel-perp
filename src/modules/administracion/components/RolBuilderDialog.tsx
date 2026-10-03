import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../../../components/common/Icon'
import RolForm from './RolForm'
import type { PermisoModulo } from '../types/usuario'

interface RolBuilderDialogProps {
  open: boolean
  modulos: PermisoModulo[]
  onClose: () => void
  onSubmit: (nombreRol: string, idPermisos: number[]) => Promise<void> | void
  mode?: 'create' | 'edit'
  initialNombre?: string
  initialPermisos?: number[]
  disabled?: boolean
}

function RolBuilderDialog({
  open,
  modulos,
  onClose,
  onSubmit,
  mode = 'create',
  initialNombre = '',
  initialPermisos,
  disabled = false,
}: RolBuilderDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [formKey, setFormKey] = useState(0)
  const [isFormBusy, setIsFormBusy] = useState(false)

  const isEdit = mode === 'edit'
  const isBusy = isFormBusy || disabled

  const handleClose = useEffectEvent(() => {
    if (!isBusy) onClose()
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

    if (open && !dialog.open) {
      dialog.showModal()
      // Remonta el formulario para reiniciar su estado con los valores iniciales.
      setFormKey((prev) => prev + 1)
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="rol-builder-title"
      className="m-auto w-full max-w-4xl rounded-2xl border border-gray-200/80 bg-white shadow-card backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name={isEdit ? 'icon-edit' : 'icon-plus-circle'} className="size-5" />
          </span>
          <div>
            <h2 id="rol-builder-title" className="font-sora text-base font-semibold text-navy-950">
              {isEdit ? 'Editar permisos' : 'Crear rol'}
            </h2>
            <p className="text-xs text-gray-500">
              {isEdit
                ? `Ajusta los permisos de "${initialNombre}".`
                : 'Define el nombre y los permisos del nuevo rol.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          aria-label="Cerrar"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="icon-close" className="size-4" />
        </button>
      </div>

      <RolForm
        key={formKey}
        mode={mode}
        modulos={modulos}
        initialNombre={initialNombre}
        initialPermisos={initialPermisos}
        onSubmit={onSubmit}
        onSuccess={onClose}
        onCancel={onClose}
        disabled={disabled}
        layout="dialog"
        onBusyChange={setIsFormBusy}
      />
    </dialog>,
    document.body,
  )
}

export default RolBuilderDialog
