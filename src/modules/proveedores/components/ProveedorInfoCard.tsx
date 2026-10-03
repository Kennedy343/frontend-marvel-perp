import type { ProveedorFormData, ProveedorFormErrors } from '../types/proveedor'
import ProveedorSectionCard from './ProveedorSectionCard'
import TextField from './fields/TextField'

interface ProveedorInfoCardProps {
  formData: ProveedorFormData
  errors: ProveedorFormErrors
  onChange: (field: keyof ProveedorFormData, value: string) => void
  disabled?: boolean
}

export default function ProveedorInfoCard({
  formData,
  errors,
  onChange,
  disabled = false,
}: ProveedorInfoCardProps) {
  return (
    <ProveedorSectionCard
      icon="icon-user"
      title="Información General"
      description="Datos de identificación y contacto del proveedor."
    >
      <TextField
        id="nombreProveedor"
        label="Nombre o Razón Social"
        value={formData.nombreProveedor}
        onChange={(value) => onChange('nombreProveedor', value)}
        error={errors.nombreProveedor}
        disabled={disabled}
        placeholder="Ej. Distribuidora Central S.A."
        maxLength={100}
        required
      />

      <TextField
        id="nitProveedor"
        label="NIT"
        value={formData.nitProveedor}
        onChange={(value) => onChange('nitProveedor', value)}
        error={errors.nitProveedor}
        disabled={disabled}
        placeholder="Ej. 1234567-8"
        maxLength={20}
        required
      />

      <TextField
        id="telefonoProveedor"
        label="Teléfono"
        type="tel"
        inputMode="tel"
        value={formData.telefonoProveedor}
        onChange={(value) => onChange('telefonoProveedor', value)}
        error={errors.telefonoProveedor}
        disabled={disabled}
        placeholder="Ej. 55551234"
        maxLength={15}
        helpText="Opcional"
      />
    </ProveedorSectionCard>
  )
}
