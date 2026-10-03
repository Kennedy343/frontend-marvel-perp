import type { InputHTMLAttributes } from 'react'
import Icon from '../../../../components/common/Icon'
import type { IconName } from '../../../../components/common/Icon'
import { fieldClass } from './fieldStyles'

type NativeInputType = Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode' | 'autoComplete'>

interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helpText?: string
  icon?: IconName
  maxLength?: number
  autoFocus?: boolean
  transform?: (value: string) => string
  type?: NativeInputType['type']
  inputMode?: NativeInputType['inputMode']
  autoComplete?: NativeInputType['autoComplete']
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  icon,
  maxLength,
  autoFocus,
  transform,
  type = 'text',
  inputMode,
  autoComplete,
}: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-error-red">*</span> : null}
      </label>
      <div className={icon ? 'relative' : undefined}>
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Icon name={icon} className="size-4" />
          </div>
        ) : null}
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => {
            const next = event.target.value
            onChange(transform ? transform(next) : next)
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [helpText ? `${id}-help` : null, error ? `${id}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={fieldClass(Boolean(error), Boolean(icon))}
        />
      </div>
      {helpText ? (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helpText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-error-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default TextField
