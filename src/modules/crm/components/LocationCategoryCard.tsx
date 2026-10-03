import { useMemo } from 'react'
import SelectField from './fields/SelectField'
import FormSectionCard from './fields/FormSectionCard'
import type { CatalogoKind } from '../lib/catalogos'
import type {
  CategoriaCliente,
  ClientFormData,
  ClientFormErrors,
  Comunidad,
  Departamento,
  Municipio,
  Sector,
  SucursalOption,
} from '../types/client'

interface LocationCategoryCardProps {
  formData: ClientFormData
  errors: ClientFormErrors
  sectores: Sector[]
  departamentos: Departamento[]
  municipios: Municipio[]
  comunidades: Comunidad[]
  categorias: CategoriaCliente[]
  sucursales: SucursalOption[]
  selectedSucursal: string
  sucursalError?: string
  needsSucursalSelection: boolean
  onSucursalChange: (idSucursal: string) => void
  onSectorChange: (sectorId: string) => void
  onDepartamentoChange: (id: string) => void
  onMunicipioChange: (id: string) => void
  onChange: (field: keyof ClientFormData, value: string) => void
  onBlur?: (field: keyof ClientFormData) => void
  onQuickCreate?: (kind: CatalogoKind) => void
  quickCreateAllowed?: Partial<Record<CatalogoKind, boolean>>
  disabled?: boolean
}

function resolveQuickCreate(
  kind: CatalogoKind,
  allowed: LocationCategoryCardProps['quickCreateAllowed'],
  onQuickCreate: LocationCategoryCardProps['onQuickCreate'],
): (() => void) | undefined {
  if (!onQuickCreate || !allowed?.[kind]) return undefined
  return () => onQuickCreate(kind)
}

function LocationCategoryCard({
  formData,
  errors,
  sectores,
  departamentos,
  municipios,
  comunidades,
  categorias,
  sucursales,
  selectedSucursal,
  sucursalError,
  needsSucursalSelection,
  onSucursalChange,
  onSectorChange,
  onDepartamentoChange,
  onMunicipioChange,
  onChange,
  onBlur,
  onQuickCreate,
  quickCreateAllowed,
  disabled = false,
}: LocationCategoryCardProps) {
  const municipioOptions = useMemo(
    () =>
      municipios.flatMap((item) =>
        String(item.idDepartamento) === formData.idDepartamento
          ? [{ value: item.idMunicipio, label: item.nombreMunicipio }]
          : [],
      ),
    [municipios, formData.idDepartamento],
  )

  const comunidadOptions = useMemo(
    () =>
      comunidades.flatMap((item) =>
        String(item.idMunicipio) === formData.idMunicipio
          ? [{ value: item.idComunidad, label: item.nombreComunidad }]
          : [],
      ),
    [comunidades, formData.idMunicipio],
  )

  return (
    <FormSectionCard icon="icon-map-pin" title="Ubicación y Categorización">
      {needsSucursalSelection ? (
        <SelectField
          id="idSucursal"
          label="Sucursal de registro"
          required
          value={selectedSucursal}
          onChange={onSucursalChange}
          options={sucursales.map((item) => ({
            value: item.idSucursal,
            label: item.codigoSucursal
              ? `${item.nombreSucursal} (${item.codigoSucursal})`
              : item.nombreSucursal,
          }))}
          placeholder="Seleccione sucursal"
          error={sucursalError}
          disabled={disabled}
        />
      ) : null}

      <SelectField
        id="idDepartamento"
        label="Departamento"
        required
        value={formData.idDepartamento}
        onChange={onDepartamentoChange}
        onBlur={() => onBlur?.('idDepartamento')}
        options={departamentos.map((item) => ({
          value: item.idDepartamento,
          label: item.nombreDepartamento,
        }))}
        placeholder="Seleccione departamento"
        error={errors.idDepartamento}
        disabled={disabled}
        onQuickCreate={resolveQuickCreate('departamento', quickCreateAllowed, onQuickCreate)}
      />

      <SelectField
        id="idMunicipio"
        label="Municipio"
        required
        value={formData.idMunicipio}
        onChange={onMunicipioChange}
        onBlur={() => onBlur?.('idMunicipio')}
        options={municipioOptions}
        placeholder="Seleccione municipio"
        error={errors.idMunicipio}
        disabled={disabled || !formData.idDepartamento}
        onQuickCreate={resolveQuickCreate('municipio', quickCreateAllowed, onQuickCreate)}
      />

      <SelectField
        id="idComunidad"
        label="Comunidad"
        required
        value={formData.idComunidad}
        onChange={(value) => onChange('idComunidad', value)}
        onBlur={() => onBlur?.('idComunidad')}
        options={comunidadOptions}
        placeholder="Seleccione comunidad"
        error={errors.idComunidad}
        disabled={disabled || !formData.idMunicipio}
        onQuickCreate={resolveQuickCreate('comunidad', quickCreateAllowed, onQuickCreate)}
      />

      <SelectField
        id="idSector"
        label="Sector"
        value={formData.idSector}
        onChange={onSectorChange}
        onBlur={() => onBlur?.('idSector')}
        options={sectores.map((item) => ({ value: item.idSector, label: item.nombreSector }))}
        placeholder="Seleccione sector"
        placeholderSelectable
        error={errors.idSector}
        disabled={disabled}
        onQuickCreate={resolveQuickCreate('sector', quickCreateAllowed, onQuickCreate)}
      />

      <SelectField
        id="idCategoria"
        label="Categoría de Cliente"
        required
        value={formData.idCategoria}
        onChange={(value) => onChange('idCategoria', value)}
        onBlur={() => onBlur?.('idCategoria')}
        options={categorias.map((item) => ({ value: item.idCategoria, label: item.nombreCategoria }))}
        placeholder="Seleccione categoría"
        error={errors.idCategoria}
        disabled={disabled}
        onQuickCreate={resolveQuickCreate('categoria', quickCreateAllowed, onQuickCreate)}
      />
    </FormSectionCard>
  )
}

export default LocationCategoryCard
