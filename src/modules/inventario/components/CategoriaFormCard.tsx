import type { CategoriaFormData, CategoriaFormErrors } from '../types/categoria'

interface CategoriaFormCardProps {
  formData: CategoriaFormData
  errors: CategoriaFormErrors
  onChange: (field: keyof CategoriaFormData, value: string) => void
  disabled?: boolean
}

export default function CategoriaFormCard({
  formData,
  errors,
  onChange,
  disabled = false,
}: CategoriaFormCardProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="font-sora text-base font-semibold text-navy-950">
          Datos de la Categoría
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Nombre identificador para agrupar productos.
        </p>
      </div>

      <div>
        <label
          htmlFor="nombreCategoria"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
        >
          Nombre de la categoría <span className="text-error-red">*</span>
        </label>
        <input
          id="nombreCategoria"
          name="nombreCategoria"
          type="text"
          value={formData.nombreCategoria}
          onChange={(e) => onChange('nombreCategoria', e.target.value)}
          disabled={disabled}
          placeholder="Ej. Categoría general"
          maxLength={100}
          className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            errors.nombreCategoria
              ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
              : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
          }`}
        />
        {errors.nombreCategoria && (
          <p className="mt-1 text-xs font-medium text-error-red">{errors.nombreCategoria}</p>
        )}
      </div>
    </section>
  )
}