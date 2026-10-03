import { useCallback, useMemo, useState } from 'react'
import Icon from '../../../components/common/Icon'
import FilterCombobox, { type FilterOption } from '../../../components/common/FilterCombobox'
import type { Departamento, ProveedorFormData, ProveedorFormErrors } from '../types/proveedor'
import ProveedorSectionCard from './ProveedorSectionCard'
import QuickCreateDepartamentoModal from './QuickCreateDepartamentoModal'

interface ProveedorUbicacionCardProps {
  formData: ProveedorFormData
  errors: ProveedorFormErrors
  departamentos: Departamento[]
  onChange: (field: keyof ProveedorFormData, value: string) => void
  onDepartamentoCreated: (created: Departamento) => void
  disabled?: boolean
}

export default function ProveedorUbicacionCard({
  formData,
  errors,
  departamentos,
  onChange,
  onDepartamentoCreated,
  disabled = false,
}: ProveedorUbicacionCardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const departamentoOptions = useMemo<FilterOption[]>(
    () =>
      departamentos.map((departamento) => ({
        value: departamento.idDepartamento,
        label: departamento.nombreDepartamento,
      })),
    [departamentos],
  )

  const handleDepartamentoChange = useCallback(
    (value?: number) => {
      onChange('idDepartamento', value != null ? String(value) : '')
    },
    [onChange],
  )

  return (
    <ProveedorSectionCard
      icon="icon-map-pin"
      title="Ubicación Geográfica"
      description="Seleccione el departamento donde se ubica el proveedor."
    >
      <div>
        <label
          htmlFor="idDepartamento"
          className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
        >
          Departamento <span className="text-error-red">*</span>
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <FilterCombobox
              id="idDepartamento"
              ariaLabel="Departamento"
              placeholder={<span className="text-gray-400">Seleccionar departamento…</span>}
              emptyLabel="No se encontraron departamentos."
              items={departamentoOptions}
              value={formData.idDepartamento ? Number(formData.idDepartamento) : undefined}
              onChange={handleDepartamentoChange}
              disabled={disabled}
              invalid={Boolean(errors.idDepartamento)}
              className="h-11 rounded-lg border-gray-200 px-3.5 py-2.5 text-sm font-normal text-navy-950 hover:border-gray-300 focus-visible:border-primary-blue focus-visible:ring-2 focus-visible:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={disabled}
            aria-label="Agregar departamento"
            title="Agregar departamento"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary-blue text-primary-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="icon-plus" className="size-5" />
          </button>
        </div>
        {errors.idDepartamento && (
          <p role="alert" className="mt-1 text-xs font-medium text-error-red">
            {errors.idDepartamento}
          </p>
        )}
      </div>

      {isCreateModalOpen && (
        <QuickCreateDepartamentoModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={onDepartamentoCreated}
        />
      )}
    </ProveedorSectionCard>
  )
}
