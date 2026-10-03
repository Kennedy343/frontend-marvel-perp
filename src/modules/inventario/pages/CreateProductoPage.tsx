import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import ProductoFormCard from '../components/ProductoFormCard'
import { useCreateProducto } from '../hooks/useCreateProducto'
import { useAuthStore } from '../../../store/authStore'
import { tienePermiso } from '../../../lib/permisos'
import type { CategoriaProducto } from '../types/categoria'

const costFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function formatPreviewCosto(value: string) {
  const num = Number(value)
  if (!value || Number.isNaN(num)) return 'Q 0.00'
  return costFormatter.format(num)
}

export default function CreateProductoPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const canCreateCategoria = tienePermiso(user?.permisos, 'crear:categorias-producto')
  const [isCreatingCategoria, setIsCreatingCategoria] = useState(false)
  const {
    formData,
    availableCategorias,
    isLoadingCategorias,
    errors,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    setCategoriasSelection,
    addCategoria,
    handleSubmit,
  } = useCreateProducto()

  const handleCategoriaCreated = (categoria: CategoriaProducto) => {
    addCategoria(categoria)
    setIsCreatingCategoria(false)
  }

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nombre = formData.nombreProducto.trim()
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-producto',
          loading: 'Registrando producto…',
          success: {
            message: 'Producto creado',
            description: nombre
              ? `${nombre} fue registrado correctamente.`
              : 'El producto fue registrado correctamente.',
          },
          error: {
            message: 'No se pudo registrar el producto',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/inventario/productos'))
      .catch(() => {})
  }

  const handleCancel = () => {
    navigate('/inventario/productos')
  }

  const categoriasSet = useMemo(() => new Set(formData.categorias), [formData.categorias])

  const selectedCategoriasObj = availableCategorias.filter((cat) =>
    categoriasSet.has(cat.idCategoria)
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 motion-safe:animate-rise">
      {/* Encabezado y Breadcrumbs */}
      <div>
        <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.16em] text-primary-blue">
          Inventario <span className="mx-1 text-gray-400">›</span> Productos <span className="mx-1 text-gray-400">›</span> Crear
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Nuevo Producto
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          Registre un nuevo artículo en el catálogo con sus códigos, costos de adquisición y categorización.
        </p>
      </div>

      {/* Alerta de error */}
      {feedbackError && !isSuccess && (
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

      <form onSubmit={onFormSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario Principal (2 columnas en desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <ProductoFormCard
            formData={formData}
            errors={errors}
            availableCategorias={availableCategorias}
            isLoadingCategorias={isLoadingCategorias}
            canCreateCategoria={canCreateCategoria}
            isCreatingCategoria={isCreatingCategoria}
            onChange={handleChange}
            onCategoriasChange={setCategoriasSelection}
            onStartCreateCategoria={() => setIsCreatingCategoria(true)}
            onCancelCreateCategoria={() => setIsCreatingCategoria(false)}
            onCategoriaCreated={handleCategoriaCreated}
            disabled={isSubmitting || isSuccess}
          />
        </div>

        {/* Panel Resumen Lateral / Signature Element (1 columna en desktop) */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white p-5 shadow-soft">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Vista previa de ficha
                </span>
                <h3 className="mt-1 font-sora text-base font-semibold text-navy-950">
                  {formData.nombreProducto || 'Nombre del producto'}
                </h3>
                <p className="font-dm-sans text-xs font-mono font-medium text-primary-blue">
                  {formData.codigoProducto || 'CÓDIGO-000'}
                </p>
              </div>

              <div className="mt-4 space-y-3 font-dm-sans text-xs">
                <div>
                  <span className="text-gray-400">Último costo de referencia:</span>
                  <p className="font-sora text-lg font-semibold tabular-nums text-navy-950">
                    {formatPreviewCosto(formData.ultimoCosto)}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400">Categorías asignadas:</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedCategoriasObj.length === 0 ? (
                      <span className="text-gray-400 italic">Ninguna seleccionada</span>
                    ) : (
                      selectedCategoriasObj.map((cat) => (
                        <span
                          key={cat.idCategoria}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-primary-blue"
                        >
                          {cat.nombreCategoria}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {formData.descripcion && (
                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-gray-400">Descripción:</span>
                    <p className="mt-1 text-gray-600 line-clamp-3 leading-relaxed">
                      {formData.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="icon-check" className="size-4" />
                <span>{isSubmitting ? 'Guardando producto…' : 'Guardar Producto'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isSuccess}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
