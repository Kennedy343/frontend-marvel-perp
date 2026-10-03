import { isAxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { proveedorService } from '../services/proveedorService'
import type {
  CreateProveedorPayload,
  Departamento,
  ProveedorFormData,
  ProveedorFormErrors,
} from '../types/proveedor'

const initialFormData: ProveedorFormData = {
  nombreProveedor: '',
  nitProveedor: '',
  telefonoProveedor: '',
  idDepartamento: '',
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
      return 'El departamento no existe o está inactivo, o ya existe un proveedor con estos datos.'
    }
    if (error.response?.status === 404) {
      return 'El endpoint /proveedores no fue encontrado en el servidor (404).'
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
  return 'Ocurrió un error inesperado al registrar el proveedor.'
}

export function useCreateProveedor() {
  const [formData, setFormData] = useState<ProveedorFormData>(initialFormData)
  const [errors, setErrors] = useState<ProveedorFormErrors>({})
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        setIsLoadingCatalogs(true)
        const deptos = await proveedorService.getDepartamentos()
        if (isMounted) {
          setDepartamentos(deptos)
        }
      } catch (err) {
        console.error('Error al cargar departamentos:', err)
        if (isMounted) {
          setFeedbackError('No se pudieron cargar los departamentos.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalogs(false)
        }
      }
    }

    loadCatalogs()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = useCallback((field: keyof ProveedorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const addDepartamento = useCallback((created: Departamento) => {
    setDepartamentos((prev) =>
      prev.some((d) => d.idDepartamento === created.idDepartamento)
        ? prev
        : [...prev, created],
    )
    setFormData((prev) => ({
      ...prev,
      idDepartamento: String(created.idDepartamento),
    }))
    setErrors((prev) =>
      prev.idDepartamento ? { ...prev, idDepartamento: undefined } : prev,
    )
    setFeedbackError(null)
  }, [])

  const validate = (): boolean => {
    const newErrors: ProveedorFormErrors = {}

    if (!formData.nombreProveedor.trim()) {
      newErrors.nombreProveedor = 'El nombre del proveedor es obligatorio.'
    } else if (formData.nombreProveedor.trim().length > 100) {
      newErrors.nombreProveedor = 'El nombre no debe superar los 100 caracteres.'
    }

    if (!formData.nitProveedor.trim()) {
      newErrors.nitProveedor = 'El NIT del proveedor es obligatorio.'
    } else if (formData.nitProveedor.trim().length > 20) {
      newErrors.nitProveedor = 'El NIT no debe superar los 20 caracteres.'
    }

    if (formData.telefonoProveedor && formData.telefonoProveedor.trim().length > 15) {
      newErrors.telefonoProveedor = 'El teléfono no debe superar los 15 caracteres.'
    }

    if (!formData.idDepartamento) {
      newErrors.idDepartamento = 'Debe seleccionar un departamento.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (onSuccess?: () => void) => {
    if (!validate()) {
      setFeedbackError('Por favor complete todos los campos obligatorios correctamente.')
      return false
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      const payload: CreateProveedorPayload = {
        nombreProveedor: formData.nombreProveedor.trim(),
        nitProveedor: formData.nitProveedor.trim(),
        telefonoProveedor: formData.telefonoProveedor.trim() || undefined,
        idDepartamento: Number(formData.idDepartamento),
      }

      await proveedorService.create(payload)
      setIsSuccess(true)

      if (onSuccess) {
        onSuccess()
      }
      return true
    } catch (err) {
      console.error('Error al crear proveedor:', err)
      const message = extractErrorMessage(err)
      setFeedbackError(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
    setFeedbackError(null)
    setIsSuccess(false)
  }, [])

  return {
    formData,
    errors,
    departamentos,
    isLoadingCatalogs,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    handleSubmit,
    resetForm,
    addDepartamento,
  }
}
