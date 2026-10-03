import { useCallback, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { cn } from '@/lib/utils'
import Icon from '../../../components/common/Icon'
import PermisosCard from './PermisosCard'
import type { PermisoModulo } from '../types/usuario'

interface RolFormProps {
  mode: 'create' | 'edit'
  modulos: PermisoModulo[]
  onSubmit: (nombreRol: string, idPermisos: number[]) => Promise<void> | void
  onSuccess?: () => void
  onCancel: () => void
  initialNombre?: string
  initialPermisos?: number[]
  disabled?: boolean
  permissionsDisabled?: boolean
  layout?: 'dialog' | 'page'
  onBusyChange?: (busy: boolean) => void
}

// Hoisted pure function (Vercel: prefer-module-scope-pure-function).
function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data) {
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join('. ')
      }
      if (typeof data.message === 'string') {
        return data.message
      }
    }
    if (error.response?.status === 403) {
      return 'No tienes permisos para gestionar roles.'
    }
    if (error.response?.status === 409) {
      return 'Ya existe un rol con ese nombre.'
    }
    return error.message || 'No se pudo guardar el rol.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'No se pudo guardar el rol.'
}

function RolForm({
  mode,
  modulos,
  onSubmit,
  onSuccess,
  onCancel,
  initialNombre = '',
  initialPermisos,
  disabled = false,
  permissionsDisabled = false,
  layout = 'page',
  onBusyChange,
}: RolFormProps) {
  const isEdit = mode === 'edit'
  const isPage = layout === 'page'

  const [nombreRol, setNombreRol] = useState(initialNombre)
  const [nameError, setNameError] = useState<string | null>(null)
  const [selectedPermisos, setSelectedPermisos] = useState<Set<number>>(
    () => new Set(initialPermisos ?? []),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const isBusy = isSubmitting || disabled
  const permisosDisabled = isBusy || permissionsDisabled

  const togglePermiso = useCallback((idPermiso: number) => {
    setSelectedPermisos((prev) => {
      const next = new Set(prev)
      if (next.has(idPermiso)) {
        next.delete(idPermiso)
      } else {
        next.add(idPermiso)
      }
      return next
    })
    setFeedbackError(null)
  }, [])

  const toggleAllInModulo = useCallback((acciones: { idPermiso: number }[]) => {
    setSelectedPermisos((prev) => {
      const next = new Set(prev)
      const allSelected = acciones.every((accion) => next.has(accion.idPermiso))
      acciones.forEach((accion) => {
        if (allSelected) {
          next.delete(accion.idPermiso)
        } else {
          next.add(accion.idPermiso)
        }
      })
      return next
    })
    setFeedbackError(null)
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nombre = nombreRol.trim()
    if (!isEdit && !nombre) {
      setNameError('El nombre del rol es obligatorio.')
      toast.warning('El nombre del rol es obligatorio.')
      return
    }

    if (!permissionsDisabled && selectedPermisos.size === 0) {
      setFeedbackError('Debe seleccionar al menos un permiso.')
      toast.warning('Debe seleccionar al menos un permiso.')
      return
    }

    try {
      setIsSubmitting(true)
      onBusyChange?.(true)
      setFeedbackError(null)
      await onSubmit(nombre, Array.from(selectedPermisos))
      onSuccess?.()
    } catch (error) {
      setFeedbackError(extractErrorMessage(error))
    } finally {
      setIsSubmitting(false)
      onBusyChange?.(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(isPage && 'rounded-2xl border border-gray-200/80 bg-white shadow-soft')}
    >
      <div className={cn('space-y-5', isPage ? 'p-6 sm:p-7' : 'max-h-[65vh] overflow-y-auto px-6 py-5')}>
        {feedbackError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-error-red"
          >
            {feedbackError}
          </div>
        ) : null}

        {isEdit ? (
          <div className="space-y-1.5">
            <p className="block text-sm font-medium text-gray-700">Rol</p>
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 font-sora text-sm font-semibold text-navy-950">
              {initialNombre}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="nombreRol" className="block text-sm font-medium text-gray-700">
              Nombre del rol <span className="text-error-red">*</span>
            </label>
            <input
              id="nombreRol"
              type="text"
              value={nombreRol}
              onChange={(event) => {
                setNombreRol(event.target.value)
                if (nameError) setNameError(null)
                setFeedbackError(null)
              }}
              disabled={isBusy}
              placeholder="Ej. Supervisor de inventario"
              aria-invalid={Boolean(nameError)}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                nameError
                  ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
                  : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
              }`}
            />
            {nameError ? (
              <p role="alert" className="text-xs font-medium text-error-red">
                {nameError}
              </p>
            ) : null}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-700">Permisos</p>
            <div className="h-px flex-1 bg-gray-200/80" />
            <span className="text-xs font-medium text-gray-500">
              {selectedPermisos.size} seleccionado{selectedPermisos.size === 1 ? '' : 's'}
            </span>
          </div>
          {permissionsDisabled ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-700">
              No tienes permiso para asignar permisos. El rol se creará sin permisos.
            </p>
          ) : null}
          <PermisosCard
            modulos={modulos}
            selectedPermisos={selectedPermisos}
            onTogglePermiso={togglePermiso}
            onToggleAllInModulo={toggleAllInModulo}
            disabled={permisosDisabled}
          />
        </div>
      </div>

      <div
        className={cn(
          'flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4',
          isPage && 'sticky bottom-0 rounded-b-2xl border-gray-200/80 bg-white/90 backdrop-blur',
        )}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isBusy}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-5 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="icon-check" className="size-4" />
          {isSubmitting ? (isEdit ? 'Guardando…' : 'Creando…') : isEdit ? 'Guardar cambios' : 'Crear rol'}
        </button>
      </div>
    </form>
  )
}

export default RolForm
