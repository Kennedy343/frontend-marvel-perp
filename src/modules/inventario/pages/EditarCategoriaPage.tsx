import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import CategoriaFormCard from '../components/CategoriaFormCard'
import { useEditarCategoria } from '../hooks/useEditarCategoria'

export default function EditarCategoriaPage() {
  const navigate = useNavigate()
  const { idCategoria } = useParams()
  const id = Number(idCategoria)

  const {
    categoria,
    formData,
    errors,
    isLoading,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    handleSubmit,
  } = useEditarCategoria(id)

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const toastId = 'update-categoria'
    toast.loading('Guardando cambios…', { id: toastId })
    const ok = await handleSubmit(() => {
      const nombre = formData.nombreCategoria.trim()
      toast.success('Categoría actualizada', {
        id: toastId,
        description: nombre
          ? `${nombre} fue actualizada correctamente.`
          : 'La categoría fue actualizada correctamente.',
      })
      navigate('/inventario/categorias')
    })
    if (!ok) {
      toast.error('No se pudo actualizar la categoría', {
        id: toastId,
        description: 'Revisa los datos marcados e inténtalo de nuevo.',
      })
    }
  }

  const handleCancel = () => {
    navigate('/inventario/categorias')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 motion-safe:animate-rise">
      <div>
        <p className="text-sm text-gray-500">
          Inventario <span className="mx-2">›</span> Categorías <span className="mx-2">›</span> Editar
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Editar Categoría
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          {categoria
            ? `Modificando la categoría "${categoria.nombreCategoria}"`
            : 'Actualice la información de la categoría.'}
        </p>
      </div>

      {isLoading && (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Cargando datos de la categoría…
        </p>
      )}

      {!isLoading && feedbackError && !isSuccess && (
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

      {!isLoading && (
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
              {isSubmitting ? 'Guardando cambios…' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}