import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import CategoriaFormCard from '../components/CategoriaFormCard'
import { useCreateCategoria } from '../hooks/useCreateCategoria'

export default function CreateCategoriaPage() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    handleSubmit,
  } = useCreateCategoria()

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nombre = formData.nombreCategoria.trim()
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-categoria',
          loading: 'Registrando categoría…',
          success: {
            message: 'Categoría creada',
            description: nombre
              ? `${nombre} fue registrada correctamente.`
              : 'La categoría fue registrada correctamente.',
          },
          error: {
            message: 'No se pudo registrar la categoría',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/inventario/categorias'))
      .catch(() => {})
  }

  const handleCancel = () => {
    navigate('/inventario/categorias')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 motion-safe:animate-rise">
      <div>
        <p className="text-sm text-gray-500">
          Inventario <span className="mx-2">›</span> Categorías <span className="mx-2">›</span> Crear
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Nueva Categoría
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          Complete la información para registrar una nueva categoría de producto.
        </p>
      </div>

      {feedbackError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
            <Icon name="icon-close" className="size-4" />
          </div>
          <p>{feedbackError}</p>
        </div>
      )}

      <form onSubmit={onFormSubmit} noValidate className="space-y-6">
        <CategoriaFormCard
          formData={formData}
          errors={errors}
          onChange={handleChange}
          disabled={isSubmitting || isSuccess}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isSuccess}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Guardando categoría…' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}