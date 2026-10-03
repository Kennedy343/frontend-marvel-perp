import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { usuarioService } from '../services/usuarioService'
import {
  extractUsuarioErrorMessage,
  validarAlcanceUsuario,
  validarInformacionUsuario,
  validarUsuarioForm,
} from '../lib/usuarioForm'
import { useUsuarioFormState } from './useUsuarioFormState'

export function useEditarUsuario(idUsuario: number) {
  const form = useUsuarioFormState()
  const {
    formData,
    setFormData,
    setRoles,
    setSucursales,
    setErrors,
    setSelectedRoles,
    setSelectedSucursales,
    setIsLoadingCatalogs,
    setFeedbackError,
    setIsSubmitting,
    setIsSuccess,
    selectedRoles,
    selectedSucursales,
  } = form
  const initialSelectedSucursalesRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setIsLoadingCatalogs(true)
        const [detalle, rolesData, sucursalesData] = await Promise.all([
          usuarioService.getById(idUsuario),
          usuarioService.getRoles(),
          usuarioService.getSucursales(),
        ])
        if (!active) return

        const userSucursales = new Set(detalle.sucursales)
        const userRoles = new Set(detalle.idRoles)

        setFormData({
          nombreUsuario: detalle.nombreUsuario,
          apellidoUsuario: detalle.apellidoUsuario,
          correoUsuario: detalle.correoUsuario,
          passwordUsuario: '',
        })
        setRoles(rolesData)
        setSucursales(sucursalesData)
        setSelectedRoles(userRoles)
        setSelectedSucursales(userSucursales)
        initialSelectedSucursalesRef.current = new Set(userSucursales)
      } catch (error) {
        if (active) setFeedbackError(extractUsuarioErrorMessage(error, 'edit'))
      } finally {
        if (active) setIsLoadingCatalogs(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [
    idUsuario,
    setFeedbackError,
    setIsLoadingCatalogs,
    setFormData,
    setRoles,
    setSelectedRoles,
    setSelectedSucursales,
    setSucursales,
  ])

  const validateStep = useCallback(
    (currentStep: number): boolean => {
      const validation =
        currentStep === 1
          ? validarInformacionUsuario(formData, {
              passwordRequired: false,
              minPasswordLength: 8,
            })
          : currentStep === 2
            ? validarAlcanceUsuario(selectedRoles, selectedSucursales)
            : {}

      setErrors(validation)
      setFeedbackError(null)
      if (Object.keys(validation).length > 0) {
        toast.warning(
          currentStep === 2
            ? 'Selecciona al menos un rol y una sucursal para continuar.'
            : 'Revisa los campos marcados para continuar.',
        )
        return false
      }
      return true
    },
    [formData, selectedRoles, selectedSucursales, setErrors, setFeedbackError],
  )

  const handleSubmit = async (onSuccess?: () => void) => {
    const validation = validarUsuarioForm({
      formData,
      selectedRoles,
      selectedSucursales,
      passwordRequired: false,
      minPasswordLength: 8,
    })
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      setFeedbackError('Por favor complete todos los campos obligatorios correctamente.')
      return false
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      await usuarioService.update(idUsuario, {
        nombreUsuario: formData.nombreUsuario.trim(),
        apellidoUsuario: formData.apellidoUsuario.trim(),
        correoUsuario: formData.correoUsuario.trim(),
        idRoles: Array.from(selectedRoles),
        ...(formData.passwordUsuario ? { passwordUsuario: formData.passwordUsuario } : {}),
      })

      const sucursalCalls: Promise<void>[] = []
      for (const idSucursal of selectedSucursales) {
        if (!initialSelectedSucursalesRef.current.has(idSucursal)) {
          sucursalCalls.push(usuarioService.assignSucursal(idUsuario, idSucursal))
        }
      }
      for (const idSucursal of initialSelectedSucursalesRef.current) {
        if (!selectedSucursales.has(idSucursal)) {
          sucursalCalls.push(usuarioService.removeSucursal(idUsuario, idSucursal))
        }
      }
      await Promise.all(sucursalCalls)

      initialSelectedSucursalesRef.current = new Set(selectedSucursales)

      setIsSuccess(true)
      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      console.error('Error al editar usuario:', error)
      setFeedbackError(extractUsuarioErrorMessage(error, 'edit'))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { ...form, handleSubmit, validateStep }
}
