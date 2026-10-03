import { isAxiosError } from 'axios'
import type { UsuarioInfoErrors, UsuarioInfoForm } from '../types/usuario'

// Hoisted static values (Vercel: prefer-module-scope-static-value).
export const EMPTY_USUARIO_FORM: UsuarioInfoForm = {
  nombreUsuario: '',
  apellidoUsuario: '',
  correoUsuario: '',
  passwordUsuario: '',
}

export interface UsuarioFormStep {
  label: string
  hint: string
}

export const USUARIO_FORM_STEPS: readonly UsuarioFormStep[] = [
  { label: 'Información', hint: 'Datos de identidad del usuario.' },
  { label: 'Rol y sucursal', hint: 'Define el alcance del usuario.' },
] as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ValidarInformacionParams {
  passwordRequired: boolean
  minPasswordLength: number
}

export function validarInformacionUsuario(
  formData: UsuarioInfoForm,
  { passwordRequired, minPasswordLength }: ValidarInformacionParams,
): UsuarioInfoErrors {
  const errors: UsuarioInfoErrors = {}

  if (!formData.nombreUsuario.trim()) {
    errors.nombreUsuario = 'El nombre es obligatorio.'
  }
  if (!formData.apellidoUsuario.trim()) {
    errors.apellidoUsuario = 'El apellido es obligatorio.'
  }
  if (!formData.correoUsuario.trim()) {
    errors.correoUsuario = 'El correo es obligatorio.'
  } else if (!EMAIL_REGEX.test(formData.correoUsuario.trim())) {
    errors.correoUsuario = 'Debe ser un correo válido.'
  }

  const password = formData.passwordUsuario
  if (passwordRequired && !password) {
    errors.passwordUsuario = 'La contraseña es obligatoria.'
  } else if (password && password.length < minPasswordLength) {
    errors.passwordUsuario = `La contraseña debe tener al menos ${minPasswordLength} caracteres.`
  }

  return errors
}

export function validarAlcanceUsuario(
  selectedRoles: Set<number>,
  selectedSucursales: Set<number>,
): UsuarioInfoErrors {
  const errors: UsuarioInfoErrors = {}

  if (selectedRoles.size === 0) {
    errors.idRoles = 'Debe seleccionar al menos un rol.'
  }
  if (selectedSucursales.size === 0) {
    errors.sucursales = 'Debe seleccionar al menos una sucursal.'
  }

  return errors
}

interface ValidarUsuarioFormParams {
  formData: UsuarioInfoForm
  selectedRoles: Set<number>
  selectedSucursales: Set<number>
  passwordRequired: boolean
  minPasswordLength: number
}

export function validarUsuarioForm({
  formData,
  selectedRoles,
  selectedSucursales,
  passwordRequired,
  minPasswordLength,
}: ValidarUsuarioFormParams): UsuarioInfoErrors {
  return {
    ...validarInformacionUsuario(formData, { passwordRequired, minPasswordLength }),
    ...validarAlcanceUsuario(selectedRoles, selectedSucursales),
  }
}

export function extractUsuarioErrorMessage(error: unknown, mode: 'create' | 'edit'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data) {
      if (Array.isArray(data.message) && data.message.length > 0) {
        return data.message.join('. ')
      }
      if (typeof data.message === 'string') {
        return data.message
      }
      if (typeof data.error === 'string') {
        return data.error
      }
    }
    if (error.response?.status === 403) {
      return 'No tienes permisos para realizar esta acción.'
    }
    if (error.response?.status === 404) {
      return 'No se encontró el usuario.'
    }
    if (error.response?.status === 409) {
      return 'Ya existe un usuario con ese correo.'
    }
    if (error.response?.status === 400) {
      return 'Datos inválidos según el servidor (400 Bad Request).'
    }
    if (error.response?.status === 500) {
      return 'Error interno del servidor (500).'
    }
    return error.message || 'Error de comunicación con el servidor.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return mode === 'edit'
    ? 'Ocurrió un error inesperado al editar el usuario.'
    : 'Ocurrió un error inesperado al registrar el usuario.'
}
