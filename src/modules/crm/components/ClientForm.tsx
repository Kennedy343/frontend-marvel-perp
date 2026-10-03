import { useMemo, useState, type FormEvent } from 'react'
import Icon from '../../../components/common/Icon'
import LocationCategoryCard from './LocationCategoryCard'
import PersonalInfoCard from './PersonalInfoCard'
import QuickCreateCatalogModal from './QuickCreateCatalogModal'
import { useAuthStore } from '../../../store/authStore'
import { tienePermiso } from '../../../lib/permisos'
import { CATALOGO_KINDS, CATALOGO_META, type CatalogoKind } from '../lib/catalogos'
import type { UseClientFormResult } from '../hooks/useClientForm'

interface ClientFormProps {
  form: UseClientFormResult
  submitLabel: string
  loadingSubmitLabel: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function ClientForm({
  form,
  submitLabel,
  loadingSubmitLabel,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const {
    formData,
    errors,
    sectores,
    departamentos,
    municipios,
    comunidades,
    categorias,
    isSubmitting,
    isSuccess,
    feedbackError,
    sucursales,
    selectedSucursal,
    sucursalError,
    needsSucursalSelection,
    requiredFieldsFilled,
    requiredFieldsTotal,
    handleChange,
    handleBlur,
    handleSectorChange,
    handleSucursalChange,
    handleDepartamentoChange,
    handleMunicipioChange,
    addCatalogo,
  } = form

  const permisos = useAuthStore((state) => state.user?.permisos)
  const [quickCreateKind, setQuickCreateKind] = useState<CatalogoKind | null>(null)

  const quickCreateAllowed = useMemo(
    () =>
      CATALOGO_KINDS.reduce<Partial<Record<CatalogoKind, boolean>>>((acc, kind) => {
        acc[kind] = tienePermiso(permisos, CATALOGO_META[kind].permission)
        return acc
      }, {}),
    [permisos],
  )

  const quickCreateParentId =
    quickCreateKind === 'municipio'
      ? Number(formData.idDepartamento)
      : quickCreateKind === 'comunidad'
        ? Number(formData.idMunicipio)
        : undefined

  const isLocked = isSubmitting || isSuccess
  const showErrorBanner = Boolean(feedbackError) && !isSuccess

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {showErrorBanner ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
            <Icon name="icon-close" className="size-4" />
          </div>
          <p>{feedbackError}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <PersonalInfoCard
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLocked}
        />

        <LocationCategoryCard
          formData={formData}
          errors={errors}
          sectores={sectores}
          departamentos={departamentos}
          municipios={municipios}
          comunidades={comunidades}
          categorias={categorias}
          sucursales={sucursales}
          selectedSucursal={selectedSucursal}
          sucursalError={sucursalError}
          needsSucursalSelection={needsSucursalSelection}
          onSucursalChange={handleSucursalChange}
          onSectorChange={handleSectorChange}
          onDepartamentoChange={handleDepartamentoChange}
          onMunicipioChange={handleMunicipioChange}
          onChange={handleChange}
          onBlur={handleBlur}
          onQuickCreate={setQuickCreateKind}
          quickCreateAllowed={quickCreateAllowed}
          disabled={isLocked}
        />
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white/90 p-4 shadow-soft backdrop-blur">
        <p className="text-xs text-gray-500">
          <span className="font-semibold tabular-nums text-navy-950">
            {requiredFieldsFilled}/{requiredFieldsTotal}
          </span>{' '}
          campos obligatorios completados
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLocked}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLocked}
            className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? loadingSubmitLabel : submitLabel}
          </button>
        </div>
      </div>

      {quickCreateKind && (
        <QuickCreateCatalogModal
          kind={quickCreateKind}
          parentId={quickCreateParentId}
          onClose={() => setQuickCreateKind(null)}
          onSuccess={addCatalogo}
        />
      )}
    </form>
  )
}

export default ClientForm
