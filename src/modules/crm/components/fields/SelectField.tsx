import Icon from '../../../../components/common/Icon'
import { selectClass } from './fieldStyles'

export interface SelectOption {
  value: string | number
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: SelectOption[]
  placeholder: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholderSelectable?: boolean
  onQuickCreate?: () => void
  quickCreateLabel?: string
}

function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  placeholderSelectable = false,
  onQuickCreate,
  quickCreateLabel,
}: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-error-red">*</span> : null}
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={selectClass(Boolean(error), Boolean(value))}
          >
            <option value="" disabled={!placeholderSelectable}>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
            <Icon name="icon-chevron-down" className="size-4" />
          </div>
        </div>
        {onQuickCreate ? (
          <button
            type="button"
            onClick={onQuickCreate}
            disabled={disabled}
            aria-label={quickCreateLabel ?? `Agregar ${label.toLowerCase()}`}
            title={quickCreateLabel ?? `Agregar ${label.toLowerCase()}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-blue text-primary-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="icon-plus" className="size-5" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-error-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default SelectField
