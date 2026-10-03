import TextField from './fields/TextField'
import FormSectionCard from './fields/FormSectionCard'
import type { ClientFormData, ClientFormErrors } from '../types/client'

interface PersonalInfoCardProps {
  formData: ClientFormData
  errors: ClientFormErrors
  onChange: (field: keyof ClientFormData, value: string) => void
  onBlur?: (field: keyof ClientFormData) => void
  disabled?: boolean
}

const onlyDigits = (value: string) => value.replace(/\D/g, '')
const toUpperCase = (value: string) => value.toUpperCase()

function PersonalInfoCard({
  formData,
  errors,
  onChange,
  onBlur,
  disabled = false,
}: PersonalInfoCardProps) {
  return (
    <FormSectionCard icon="icon-user" title="Información Personal">
      <TextField
        id="dpiCliente"
        label="DPI"
        required
        inputMode="numeric"
        autoComplete="off"
        maxLength={13}
        value={formData.dpiCliente}
        onChange={(value) => onChange('dpiCliente', value)}
        onBlur={() => onBlur?.('dpiCliente')}
        transform={onlyDigits}
        placeholder="0000 00000 0000"
        helpText="Formato: 13 dígitos sin guiones."
        error={errors.dpiCliente}
        disabled={disabled}
      />

      <TextField
        id="nit"
        label="NIT"
        value={formData.nit}
        onChange={(value) => onChange('nit', value)}
        onBlur={() => onBlur?.('nit')}
        transform={toUpperCase}
        placeholder="C/F"
        error={errors.nit}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="primerNombre"
          label="Primer Nombre"
          required
          autoComplete="given-name"
          value={formData.primerNombre}
          onChange={(value) => onChange('primerNombre', value)}
          onBlur={() => onBlur?.('primerNombre')}
          error={errors.primerNombre}
          disabled={disabled}
        />
        <TextField
          id="segundoNombre"
          label="Segundo Nombre"
          autoComplete="additional-name"
          value={formData.segundoNombre}
          onChange={(value) => onChange('segundoNombre', value)}
          onBlur={() => onBlur?.('segundoNombre')}
          error={errors.segundoNombre}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="primerApellido"
          label="Primer Apellido"
          required
          autoComplete="family-name"
          value={formData.primerApellido}
          onChange={(value) => onChange('primerApellido', value)}
          onBlur={() => onBlur?.('primerApellido')}
          error={errors.primerApellido}
          disabled={disabled}
        />
        <TextField
          id="segundoApellido"
          label="Segundo Apellido"
          autoComplete="off"
          value={formData.segundoApellido}
          onChange={(value) => onChange('segundoApellido', value)}
          onBlur={() => onBlur?.('segundoApellido')}
          error={errors.segundoApellido}
          disabled={disabled}
        />
      </div>

      <TextField
        id="telefono"
        label="Teléfono Principal"
        required
        type="tel"
        autoComplete="tel"
        icon="icon-phone"
        value={formData.telefono}
        onChange={(value) => onChange('telefono', value)}
        onBlur={() => onBlur?.('telefono')}
        placeholder="0000-0000"
        error={errors.telefono}
        disabled={disabled}
      />
    </FormSectionCard>
  )
}

export default PersonalInfoCard
