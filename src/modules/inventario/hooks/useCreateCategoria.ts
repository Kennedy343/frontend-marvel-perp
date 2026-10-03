import { isAxiosError } from 'axios'
import { useCallback, useState } from 'react'
import { categoriaService } from '../services/categoriaService'
import type {
  CategoriaFormData,
  CategoriaFormErrors,
  CreateCategoriaPayload,
} from '../types/categoria'

const initialFormData: CategoriaFormData = {
  nombreCategoria: '',
}

function extractErrorMessage(error: unknown): string {
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
    if (error.response?.status === 409) {
      return 'Ya existe una categoría de producto con ese nombre.'
    }
    if (error.response?.status === 404) {
      return 'El endpoint /categorias-producto no fue encontrado en el servidor (404).'
    }
    if (error.response?.status === 401) {
      return 'Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.'
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
  return 'Ocurrió un error inesperado al registrar la categoría.'
}

export function useCreateCategoria() {
  const [formData, setFormData] = useState<CategoriaFormData>(initialFormData)
  const [errors, setErrors] = useState<CategoriaFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const handleChange = useCallback((field: keyof CategoriaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const validate = (): boolean => {
    const newErrors: CategoriaFormErrors = {}

    if (!formData.nombreCategoria.trim()) {
      newErrors.nombreCategoria = 'El nombre de la categoría es obligatorio.'
    } else if (formData.nombreCategoria.trim().length > 100) {
      newErrors.nombreCategoria = 'El nombre no debe superar los 100 caracteres.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (onSuccess?: () => void) => {
    if (!validate()) {
      setFeedbackError('Por favor complete el campo obligatorio correctamente.')
      return false
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      const payload: CreateCategoriaPayload = {
        nombreCategoria: formData.nombreCategoria.trim(),
      }

      await categoriaService.create(payload)
      setIsSuccess(true)

      if (onSuccess) {
        onSuccess()
      }
      return true
    } catch (err) {
      console.error('Error al crear categoría:', err)
      const message = extractErrorMessage(err)
      setFeedbackError(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    handleSubmit,
  }
}