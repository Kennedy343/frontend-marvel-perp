import Icon from '../../../components/common/Icon'
import type {
  CompraFormData,
  CompraFormErrors,
  CompraProveedor,
  CompraSucursal,
} from '../types/compra'
import { formatFechaCompra, getTodayDate } from '../utils/fecha'

interface CompraHeaderCardProps {
  formData: CompraFormData
  errors: CompraFormErrors
  proveedores: CompraProveedor[]
  sucursales: CompraSucursal[]
  isLoadingCatalogs: boolean
  onChange: (field: keyof Omit<CompraFormData, 'detalles'>, value: string) => void
  disabled?: boolean
}

const selectBaseClass =
  'mt-1.5 w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400'

function renderSelectClass(hasError: boolean, placeholders: boolean) {
  return `${selectBaseClass} ${
    hasError
      ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
      : placeholders
        ? 'text-gray-400'
        : 'border-gray-200 text-navy-950 hover:border-gray-300 focus:border-primary-blue'
  }`
}

export default function CompraHeaderCard({
  formData,
  errors,
  proveedores,
  sucursales,
  isLoadingCatalogs,
  onChange,
  disabled = false,
}: CompraHeaderCardProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="font-sora text-base font-semibold text-navy-950">
          Datos de la Factura
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Información de la cabecera de la factura de compra.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="serieFactura"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Serie de Factura <span className="text-error-red">*</span>
          </label>
          <input
            id="serieFactura"
            name="serieFactura"
            type="text"
            value={formData.serieFactura}
            onChange={(e) => onChange('serieFactura', e.target.value)}
            disabled={disabled}
            placeholder="Ej. A"
            maxLength={20}
            className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
              errors.serieFactura
                ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
                : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
            }`}
          />
          {errors.serieFactura && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.serieFactura}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="numeroFactura"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Número de Factura <span className="text-error-red">*</span>
          </label>
          <input
            id="numeroFactura"
            name="numeroFactura"
            type="text"
            value={formData.numeroFactura}
            onChange={(e) => onChange('numeroFactura', e.target.value)}
            disabled={disabled}
            placeholder="Ej. 000123"
            maxLength={50}
            className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
              errors.numeroFactura
                ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
                : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
            }`}
          />
          {errors.numeroFactura && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.numeroFactura}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="idProveedor"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Proveedor <span className="text-error-red">*</span>
          </label>
          <select
            id="idProveedor"
            name="idProveedor"
            value={formData.idProveedor}
            onChange={(e) => onChange('idProveedor', e.target.value)}
            disabled={disabled || isLoadingCatalogs}
            className={renderSelectClass(Boolean(errors.idProveedor), !formData.idProveedor)}
          >
            <option value="">
              {isLoadingCatalogs ? 'Cargando proveedores…' : 'Seleccione un proveedor'}
            </option>
            {proveedores.map((p) => (
              <option key={p.idProveedor} value={p.idProveedor} className="text-navy-950">
                {p.nombreProveedor}
              </option>
            ))}
          </select>
          {errors.idProveedor && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.idProveedor}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="idSucursal"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Sucursal <span className="text-error-red">*</span>
          </label>
          <select
            id="idSucursal"
            name="idSucursal"
            value={formData.idSucursal}
            onChange={(e) => onChange('idSucursal', e.target.value)}
            disabled={disabled || isLoadingCatalogs}
            className={renderSelectClass(Boolean(errors.idSucursal), !formData.idSucursal)}
          >
            <option value="">
              {isLoadingCatalogs ? 'Cargando sucursales…' : 'Seleccione una sucursal'}
            </option>
            {sucursales.map((s) => (
              <option key={s.idSucursal} value={s.idSucursal} className="text-navy-950">
                {s.nombreSucursal}
              </option>
            ))}
          </select>
          {errors.idSucursal && (
            <p className="mt-1 text-xs font-medium text-error-red">{errors.idSucursal}</p>
          )}
        </div>

        <div className="sm:max-w-xs">
          <p className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Fecha de Compra
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 font-dm-sans text-sm text-navy-950">
            <Icon name="icon-calendar" className="size-4 shrink-0 text-gray-400" />
            <span>{formatFechaCompra(getTodayDate())}</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            Se registra automáticamente con la fecha y hora actuales.
          </p>
        </div>
      </div>
    </section>
  )
}