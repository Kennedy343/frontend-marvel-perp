import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { productoService } from '../services/productoService'
import { categoriaService } from '../services/categoriaService'
import type { CategoriaProducto } from '../types/categoria'
import type { CreateProductoDto, ProductoFormData } from '../types/producto'

export interface FormErrors {
  codigoProducto?: string
  nombreProducto?: string
  ultimoCosto?: string
  categorias?: string
}

const INITIAL_FORM_DATA: ProductoFormData = {
  codigoProducto: '',
  nombreProducto: '',
  descripcion: '',
  ultimoCosto: '',
  categorias: [],
}

export function useCreateProducto() {
  const [formData, setFormData] = useState<ProductoFormData>(INITIAL_FORM_DATA)
  const [availableCategorias, setAvailableCategorias] = useState<CategoriaProducto[]>([])
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCategorias() {
      try {
        setIsLoadingCategorias(true)
        const response = await categoriaService.getAll({ limit: 100 })
        if (isMounted) {
          setAvailableCategorias(response.data.filter((c) => c.activo))
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err)
      } finally {
        if (isMounted) {
          setIsLoadingCategorias(false)
        }
      }
    }

    loadCategorias()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (
    field: keyof ProductoFormData,
    value: string | number[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[field as keyof FormErrors]
        return updated
      })
    }
    if (feedbackError) setFeedbackError(null)
  }

  const setCategoriasSelection = useCallback((ids: number[]) => {
    setFormData((prev) => ({ ...prev, categorias: ids }))
    setErrors((prev) => (prev.categorias ? { ...prev, categorias: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const addCategoria = useCallback((categoria: CategoriaProducto) => {
    setAvailableCategorias((prev) =>
      prev.some((c) => c.idCategoria === categoria.idCategoria) ? prev : [...prev, categoria],
    )
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(categoria.idCategoria)
        ? prev.categorias
        : [...prev.categorias, categoria.idCategoria],
    }))
    setErrors((prev) => (prev.categorias ? { ...prev, categorias: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    const trimmedCodigo = formData.codigoProducto.trim()
    if (!trimmedCodigo) {
      newErrors.codigoProducto = 'El código del producto es obligatorio.'
    } else if (trimmedCodigo.length > 50) {
      newErrors.codigoProducto = 'El código no debe superar los 50 caracteres.'
    }

    const trimmedNombre = formData.nombreProducto.trim()
    if (!trimmedNombre) {
      newErrors.nombreProducto = 'El nombre del producto es obligatorio.'
    } else if (trimmedNombre.length > 150) {
      newErrors.nombreProducto = 'El nombre no debe superar los 150 caracteres.'
    }

    if (formData.ultimoCosto.trim()) {
      const parsedCosto = Number(formData.ultimoCosto)
      if (Number.isNaN(parsedCosto) || parsedCosto < 0) {
        newErrors.ultimoCosto = 'El costo debe ser un número positivo válido.'
      }
    }

    if (formData.categorias.length === 0) {
      newErrors.categorias = 'Debe seleccionar al menos una categoría.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (onSuccessCallback?: () => void) => {
    if (!validate()) return false

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      const payload: CreateProductoDto = {
        codigoProducto: formData.codigoProducto.trim().toUpperCase(),
        nombreProducto: formData.nombreProducto.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        activo: true,
        categorias: formData.categorias,
      }

      if (formData.ultimoCosto.trim()) {
        payload.ultimoCosto = Number(Number(formData.ultimoCosto).toFixed(2))
      }

      await productoService.create(payload)
      setIsSuccess(true)

      if (onSuccessCallback) {
        onSuccessCallback()
      }
      return true
    } catch (err) {
      console.error('Error al crear producto:', err)
      if (isAxiosError(err)) {
        const serverMessage = err.response?.data?.message
        if (Array.isArray(serverMessage)) {
          setFeedbackError(serverMessage.join('. '))
        } else if (typeof serverMessage === 'string') {
          setFeedbackError(serverMessage)
        } else if (err.response?.status === 409) {
          setFeedbackError('Ya existe un producto con este código o las categorías seleccionadas no son válidas.')
        } else {
          setFeedbackError('Ocurrió un error al registrar el producto. Verifique los datos e intente nuevamente.')
        }
      } else {
        setFeedbackError('Ocurrió un error inesperado. Intente nuevamente.')
      }
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    availableCategorias,
    isLoadingCategorias,
    errors,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    setCategoriasSelection,
    addCategoria,
    handleSubmit,
  }
}
