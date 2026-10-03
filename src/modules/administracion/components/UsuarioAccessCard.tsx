import { useMemo } from 'react'
import Icon from '../../../components/common/Icon'
import MultiSelectField, { type MultiSelectOption } from '../../../components/common/MultiSelectField'
import type {
  Rol,
  Sucursal,
  UsuarioInfoErrors,
} from '../types/usuario'

interface UsuarioAccessCardProps {
  roles: Rol[]
  sucursales: Sucursal[]
  selectedRoles: Set<number>
  selectedSucursales: Set<number>
  errors: UsuarioInfoErrors
  onRolesChange: (idRoles: number[]) => void
  onSucursalesChange: (idsSucursales: number[]) => void
  isLoadingCatalogs: boolean
  onCreateRol?: () => void
  canCreateRol?: boolean
  disabled?: boolean
}

// Hoisted pure function (Vercel: prefer-module-scope-pure-function).
function selectionCountLabel(count: number): string {
  return `${count} seleccionado${count === 1 ? '' : 's'}`
}

function UsuarioAccessCard({
  roles,
  sucursales,
  selectedRoles,
  selectedSucursales,
  errors,
  onRolesChange,
  onSucursalesChange,
  isLoadingCatalogs,
  onCreateRol,
  canCreateRol = false,
  disabled = false,
}: UsuarioAccessCardProps) {
  const rolOptions = useMemo<MultiSelectOption[]>(
    () =>
      roles.map((rol) => ({
        value: rol.idRol,
        label: rol.nombreRol,
        description: `Rol #${rol.idRol}`,
      })),
    [roles],
  )

  const sucursalOptions = useMemo<MultiSelectOption[]>(
    () =>
      sucursales.map((sucursal) => ({
        value: sucursal.idSucursal,
        label: sucursal.nombreSucursal,
      })),
    [sucursales],
  )

  const selectedRoleIds = useMemo(() => Array.from(selectedRoles), [selectedRoles])
  const selectedSucursalIds = useMemo(
    () => Array.from(selectedSucursales),
    [selectedSucursales],
  )

  const fieldsDisabled = disabled || isLoadingCatalogs

  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-center gap-3">
        <Icon name="icon-lock-open" className="size-5 shrink-0 text-primary-blue" />
        <h2 className="font-sora text-base font-semibold text-navy-950 sm:text-lg">
          Rol y sucursal
        </h2>
        <div className="h-px flex-1 bg-gray-200/80" />
        {canCreateRol && onCreateRol ? (
          <button
            type="button"
            onClick={onCreateRol}
            disabled={fieldsDisabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-1.5 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:border-primary-blue hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="icon-plus-circle" className="size-4" />
            Crear rol
          </button>
        ) : null}
      </div>

      <p className="mt-2 font-dm-sans text-sm text-gray-500">
        Define qué roles y en qué sucursales podrá operar el usuario.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="rolesAsignados" className="block text-sm font-medium text-gray-700">
              Roles asignados <span className="text-error-red">*</span>
            </label>
            <span className="font-dm-sans text-xs text-gray-500">
              {selectionCountLabel(selectedRoles.size)}
            </span>
          </div>
          <MultiSelectField
            id="rolesAsignados"
            ariaLabel="Roles asignados"
            items={rolOptions}
            selectedIds={selectedRoleIds}
            onChange={onRolesChange}
            placeholder={isLoadingCatalogs ? 'Cargando roles…' : 'Buscar y asignar roles…'}
            emptyLabel="No se encontraron roles."
            disabled={fieldsDisabled}
            invalid={Boolean(errors.idRoles)}
          />
          {errors.idRoles ? (
            <p role="alert" className="text-xs font-medium text-error-red">{errors.idRoles}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sucursalesAsignadas" className="block text-sm font-medium text-gray-700">
              Sucursales <span className="text-error-red">*</span>
            </label>
            <span className="font-dm-sans text-xs text-gray-500">
              {selectionCountLabel(selectedSucursales.size)}
            </span>
          </div>
          <MultiSelectField
            id="sucursalesAsignadas"
            ariaLabel="Sucursales"
            items={sucursalOptions}
            selectedIds={selectedSucursalIds}
            onChange={onSucursalesChange}
            placeholder={isLoadingCatalogs ? 'Cargando sucursales…' : 'Buscar y asignar sucursales…'}
            emptyLabel="No se encontraron sucursales."
            disabled={fieldsDisabled}
            invalid={Boolean(errors.sucursales)}
          />
          {errors.sucursales ? (
            <p role="alert" className="text-xs font-medium text-error-red">{errors.sucursales}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default UsuarioAccessCard
