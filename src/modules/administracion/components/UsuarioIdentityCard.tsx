import { useState } from 'react'
import { cn } from '@/lib/utils'
import Icon from '../../../components/common/Icon'
import type { UsuarioInfoErrors, UsuarioInfoForm } from '../types/usuario'

interface UsuarioIdentityCardProps {
  formData: UsuarioInfoForm
  errors: UsuarioInfoErrors
  onChange: (field: keyof UsuarioInfoForm, value: string) => void
  disabled?: boolean
  passwordOptional?: boolean
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
    hasError
      ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
      : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
  }`
}

function UsuarioIdentityCard({
  formData,
  errors,
  onChange,
  disabled = false,
  passwordOptional = false,
}: UsuarioIdentityCardProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-center gap-3">
        <Icon name="icon-user" className="size-5 shrink-0 text-primary-blue" />
        <h2 className="font-sora text-base font-semibold text-navy-950 sm:text-lg">
          Información del Usuario
        </h2>
        <div className="h-px flex-1 bg-gray-200/80" />
      </div>

      <div className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700">
              Nombre <span className="text-error-red">*</span>
            </label>
            <input
              id="nombreUsuario"
              type="text"
              value={formData.nombreUsuario}
              onChange={(e) => onChange('nombreUsuario', e.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.nombreUsuario)}
              className={inputClass(Boolean(errors.nombreUsuario))}
            />
            {errors.nombreUsuario ? (
              <p role="alert" className="text-xs font-medium text-error-red">{errors.nombreUsuario}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="apellidoUsuario" className="block text-sm font-medium text-gray-700">
              Apellido <span className="text-error-red">*</span>
            </label>
            <input
              id="apellidoUsuario"
              type="text"
              value={formData.apellidoUsuario}
              onChange={(e) => onChange('apellidoUsuario', e.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(errors.apellidoUsuario)}
              className={inputClass(Boolean(errors.apellidoUsuario))}
            />
            {errors.apellidoUsuario ? (
              <p role="alert" className="text-xs font-medium text-error-red">{errors.apellidoUsuario}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="correoUsuario" className="block text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-error-red">*</span>
          </label>
          <input
            id="correoUsuario"
            type="email"
            value={formData.correoUsuario}
            onChange={(e) => onChange('correoUsuario', e.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.correoUsuario)}
            className={inputClass(Boolean(errors.correoUsuario))}
          />
          {errors.correoUsuario ? (
            <p role="alert" className="text-xs font-medium text-error-red">{errors.correoUsuario}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="passwordUsuario" className="block text-sm font-medium text-gray-700">
            Contraseña {passwordOptional ? <span className="text-gray-400">(opcional)</span> : <span className="text-error-red">*</span>}
          </label>
          <div className="relative">
            <input
              id="passwordUsuario"
              type={showPassword ? 'text' : 'password'}
              value={formData.passwordUsuario}
              onChange={(e) => onChange('passwordUsuario', e.target.value)}
              disabled={disabled}
              placeholder={passwordOptional ? 'Dejar en blanco para no cambiar' : ''}
              aria-invalid={Boolean(errors.passwordUsuario)}
              aria-describedby="password-help"
              className={cn(inputClass(Boolean(errors.passwordUsuario)), 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name={showPassword ? 'icon-eye-off' : 'icon-eye'} className="size-4.5" />
            </button>
          </div>
          <p id="password-help" className="text-xs text-gray-500">
            {passwordOptional
              ? 'Si se deja en blanco, se mantiene la actual. Mínimo 8 caracteres.'
              : 'Mínimo 8 caracteres.'}
          </p>
          {errors.passwordUsuario ? (
            <p role="alert" className="text-xs font-medium text-error-red">{errors.passwordUsuario}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default UsuarioIdentityCard
