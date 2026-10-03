import { useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import Icon from '../../../components/common/Icon'
import { categoriaService } from '../services/categoriaService'
import type { CategoriaProducto } from '../types/categoria'

const MAX_NOMBRE_LENGTH = 100

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
      if (typeof data.error === 'string') {
        return data.error
      }
    }
    if (error.response?.status === 409) {
      return 'Ya existe una categoría con ese nombre.'
    }
    if (error.response?.status === 401) {
      return 'Sesión expirada o no autorizada. Inicia sesión nuevamente.'
    }
    if (error.response?.status === 400) {
      return 'Datos inválidos. Revisa el nombre de la categoría.'
    }
    return error.message || 'Error de comunicación con el servidor.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'No se pudo crear la categoría.'
}

interface QuickCreateCategoriaProps {
  onCreated: (categoria: CategoriaProducto) => void
  onCancel: () => void
  disabled?: boolean
}

export default function QuickCreateCategoria({
  onCreated,
  onCancel,
  disabled = false,
}: QuickCreateCategoriaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    const trimmed = nombre.trim()
    if (!trimmed) {
      setError('El nombre de la categoría es obligatorio.')
      inputRef.current?.focus()
      return
    }
    if (trimmed.length > MAX_NOMBRE_LENGTH) {
      setError('El nombre no debe superar los 100 caracteres.')
      return
    }

    try {
      setIsCreating(true)
      setError(null)
      const created = await categoriaService.create({ nombreCategoria: trimmed })
      onCreated(created)
    } catch (err) {
      setError(extractErrorMessage(err))
      inputRef.current?.focus()
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <label htmlFor="quickCategoriaNombre" className="sr-only">
          Nombre de la nueva categoría
        </label>
        <input
          ref={inputRef}
          id="quickCategoriaNombre"
          autoFocus
          type="text"
          value={nombre}
          disabled={disabled || isCreating}
          maxLength={MAX_NOMBRE_LENGTH}
          onChange={(event) => {
            setNombre(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleCreate()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              onCancel()
            }
          }}
          placeholder="Ej. Categoría general"
          className={`w-full rounded-lg border px-3 py-2 font-dm-sans text-sm text-navy-950 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 ${
            error
              ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
              : 'border-gray-200 bg-white hover:border-gray-300 focus:border-primary-blue'
          }`}
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={disabled || isCreating}
          aria-label="Guardar categoría"
          title="Guardar categoría"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isCreating ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Icon name="icon-check" className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled || isCreating}
          aria-label="Cancelar creación de categoría"
          title="Cancelar"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="icon-close" className="size-4" />
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-1 font-dm-sans text-xs font-medium text-error-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}
