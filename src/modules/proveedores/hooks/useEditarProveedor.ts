import { isAxiosError } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { proveedorService } from '../services/proveedorService'
import type {
  Departamento,
  Proveedor,
  ProveedorFormData,
  ProveedorFormErrors,
  UpdateProveedorPayload,
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
      return 'El departamento no existe o está inactivo.'
    }
    if (error.response?.status === 404) {
      return 'El proveedor no fue encontrado (404).'
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
  return 'Ocurrió un error inesperado al actualizar el proveedor.'
}

export function useEditarProveedor(idProveedor: number) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState<ProveedorFormData>(initialFormData)
  const [errors, setErrors] = useState<ProveedorFormErrors>({})
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!idProveedor || Number.isNaN(idProveedor)) {
        setIsLoading(false)
        setFeedbackError('ID de proveedor inválido.')
        return
      }

      try {
        setIsLoading(true)
        // Parallel data fetching (async-parallel)
        const [proveedorData, deptosData] = await Promise.all([
          proveedorService.getById(idProveedor),
          proveedorService.getDepartamentos(),
        ])

        if (isMounted) {
          setProveedor(proveedorData)
          setDepartamentos(deptosData)
          setFormData({
            nombreProveedor: proveedorData.nombreProveedor || '',
            nitProveedor: proveedorData.nitProveedor || '',
            telefonoProveedor: proveedorData.telefonoProveedor || '',
            idDepartamento:
              proveedorData.idDepartamento &&
              deptosData.some((depto) => depto.idDepartamento === proveedorData.idDepartamento)
                ? String(proveedorData.idDepartamento)
                : '',
          })
        }
      } catch (err) {
        console.error('Error al cargar datos del proveedor:', err)
        if (isMounted) {
          setFeedbackError('No se pudo cargar la información del proveedor.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [idProveedor])

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

      const payload: UpdateProveedorPayload = {
        nombreProveedor: formData.nombreProveedor.trim(),
        nitProveedor: formData.nitProveedor.trim(),
        telefonoProveedor: formData.telefonoProveedor.trim() || undefined,
        idDepartamento: Number(formData.idDepartamento),
      }

      await proveedorService.update(idProveedor, payload)
      setIsSuccess(true)

      if (onSuccess) {
        onSuccess()
      }
      return true
    } catch (err) {
      console.error('Error al actualizar proveedor:', err)
      const message = extractErrorMessage(err)
      setFeedbackError(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    proveedor,
    formData,
    errors,
    departamentos,
    isLoading,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    handleSubmit,
    addDepartamento,
  }
}
