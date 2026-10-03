import { useMemo } from 'react'
import Icon from '../../../components/common/Icon'
import MultiSelectField, {
  type MultiSelectOption,
} from '../../../components/common/MultiSelectField'
import QuickCreateCategoria from './QuickCreateCategoria'
import type { CategoriaProducto } from '../types/categoria'
import type { ProductoFormData } from '../types/producto'
import type { FormErrors } from '../hooks/useCreateProducto'

interface ProductoFormCardProps {
  formData: ProductoFormData
  errors: FormErrors
  availableCategorias: CategoriaProducto[]
  isLoadingCategorias: boolean
  canCreateCategoria: boolean
  isCreatingCategoria: boolean
  onChange: (field: keyof ProductoFormData, value: string | number[]) => void
  onCategoriasChange: (ids: number[]) => void
  onStartCreateCategoria: () => void
  onCancelCreateCategoria: () => void
  onCategoriaCreated: (categoria: CategoriaProducto) => void
  disabled?: boolean
}

export default function ProductoFormCard({
  formData,
  errors,
  availableCategorias,
  isLoadingCategorias,
  canCreateCategoria,
  isCreatingCategoria,
  onChange,
  onCategoriasChange,
  onStartCreateCategoria,
  onCancelCreateCategoria,
  onCategoriaCreated,
  disabled = false,
}: ProductoFormCardProps) {
  const categoriaOptions = useMemo<MultiSelectOption[]>(
    () =>
      availableCategorias.map((categoria) => ({
        value: categoria.idCategoria,
        label: categoria.nombreCategoria,
      })),
    [availableCategorias],
  )

  const categoriesDisabled = disabled || isLoadingCategorias

  return (
    <div className="space-y-6">
      {/* Sección 1: Información General */}
      <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-inventory" className="size-5" />
          </span>
          <div>
            <h2 className="font-sora text-base font-semibold text-navy-950">Información del Producto</h2>
            <p className="font-dm-sans text-xs text-gray-500">Identificación básica en el catálogo</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="codigoProducto" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Código del producto <span className="text-error-red">*</span>
            </label>
            <input
              id="codigoProducto"
              type="text"
              name="codigoProducto"
              value={formData.codigoProducto}
              onChange={(e) => onChange('codigoProducto', e.target.value.toUpperCase())}
              disabled={disabled}
              placeholder="Ej. PROD-001"
              maxLength={50}
              className={`mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 font-dm-sans text-sm text-navy-950 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                errors.codigoProducto
                  ? 'border-error-red focus-visible:outline-error-red'
                  : 'border-gray-200 hover:border-gray-300 focus-visible:outline-primary-blue'
              }`}
            />
            {errors.codigoProducto ? (
              <p className="mt-1.5 text-xs font-medium text-error-red">{errors.codigoProducto}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-400">Identificador único en mayúsculas (máx. 50 caracteres).</p>
            )}
          </div>

          <div>
            <label htmlFor="nombreProducto" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Nombre del producto <span className="text-error-red">*</span>
            </label>
            <input
              id="nombreProducto"
              type="text"
              name="nombreProducto"
              value={formData.nombreProducto}
              onChange={(e) => onChange('nombreProducto', e.target.value)}
              disabled={disabled}
              placeholder="Ej. Nombre del producto"
              maxLength={150}
              className={`mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 font-dm-sans text-sm text-navy-950 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                errors.nombreProducto
                  ? 'border-error-red focus-visible:outline-error-red'
                  : 'border-gray-200 hover:border-gray-300 focus-visible:outline-primary-blue'
              }`}
            />
            {errors.nombreProducto ? (
              <p className="mt-1.5 text-xs font-medium text-error-red">{errors.nombreProducto}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-400">Nombre comercial visible (máx. 150 caracteres).</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Descripción detallada <span className="text-xs font-normal text-gray-400">(Opcional)</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => onChange('descripcion', e.target.value)}
              disabled={disabled}
              rows={3}
              placeholder="Especificaciones, marca, presentación o detalles relevantes del producto…"
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-dm-sans text-sm text-navy-950 placeholder:text-gray-400 hover:border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Sección 2: Costo de Adquisición */}
      <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Icon name="icon-cart" className="size-5" />
          </span>
          <div>
            <h2 className="font-sora text-base font-semibold text-navy-950">Costo de Adquisición</h2>
            <p className="font-dm-sans text-xs text-gray-500">Valor contable inicial de referencia</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="max-w-sm">
            <label htmlFor="ultimoCosto" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Último costo (GTQ) <span className="text-xs font-normal text-gray-400">(Opcional)</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 font-dm-sans text-sm font-semibold text-gray-500">
                Q
              </span>
              <input
                id="ultimoCosto"
                type="number"
                step="0.01"
                min="0"
                name="ultimoCosto"
                value={formData.ultimoCosto}
                onChange={(e) => onChange('ultimoCosto', e.target.value)}
                disabled={disabled}
                placeholder="0.00"
                className={`w-full rounded-lg border bg-white py-2.5 pr-3.5 pl-8 font-dm-sans text-sm text-navy-950 tabular-nums placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                  errors.ultimoCosto
                    ? 'border-error-red focus-visible:outline-error-red'
                    : 'border-gray-200 hover:border-gray-300 focus-visible:outline-primary-blue'
                }`}
              />
            </div>
            {errors.ultimoCosto ? (
              <p className="mt-1.5 text-xs font-medium text-error-red">{errors.ultimoCosto}</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-400">Referencia de costo para compras e inventario.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sección 3: Asignación de Categorías */}
      <section className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Icon name="icon-settings" className="size-5" />
          </span>
          <h2 className="font-sora text-base font-semibold text-navy-950">
            Categorías <span className="text-error-red">*</span>
          </h2>
          <div className="h-px flex-1 bg-gray-200/80" />
          {canCreateCategoria ? (
            <button
              type="button"
              onClick={onStartCreateCategoria}
              disabled={categoriesDisabled}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:border-primary-blue hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="icon-plus-circle" className="size-4" />
              Crear categoría
            </button>
          ) : null}
        </div>

        <p className="mt-2 font-dm-sans text-sm text-gray-500">
          Seleccione al menos una categoría para este producto.
        </p>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="categoriasProducto" className="block text-sm font-medium text-gray-700">
              Categorías asignadas <span className="text-error-red">*</span>
            </label>
            <span className="font-dm-sans text-xs text-gray-500">
              {formData.categorias.length} seleccionada{formData.categorias.length === 1 ? '' : 's'}
            </span>
          </div>
          <MultiSelectField
            id="categoriasProducto"
            ariaLabel="Categorías asignadas"
            items={categoriaOptions}
            selectedIds={formData.categorias}
            onChange={onCategoriasChange}
            placeholder={
              isLoadingCategorias
                ? 'Cargando categorías…'
                : 'Buscar y asignar categorías…'
            }
            emptyLabel="No se encontraron categorías."
            disabled={categoriesDisabled}
            invalid={Boolean(errors.categorias)}
          />
          {errors.categorias ? (
            <p role="alert" className="text-xs font-medium text-error-red">
              {errors.categorias}
            </p>
          ) : null}
          {isCreatingCategoria ? (
            <QuickCreateCategoria
              onCreated={onCategoriaCreated}
              onCancel={onCancelCreateCategoria}
              disabled={disabled}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}
