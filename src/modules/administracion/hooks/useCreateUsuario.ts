import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { usuarioService } from '../services/usuarioService'
import {
  extractUsuarioErrorMessage,
  validarAlcanceUsuario,
  validarInformacionUsuario,
  validarUsuarioForm,
} from '../lib/usuarioForm'
import { useUsuarioFormState } from './useUsuarioFormState'
import type { Rol } from '../types/usuario'

export function useCreateUsuario() {
  const form = useUsuarioFormState()
  const {
    formData,
    setRoles,
    setSucursales,
    setPermisos,
    setErrors,
    setIsLoadingCatalogs,
    setFeedbackError,
    setSelectedRoles,
    setIsSubmitting,
    setIsSuccess,
    selectedRoles,
    selectedSucursales,
  } = form

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        setIsLoadingCatalogs(true)
        const [rolesData, sucursalesData, permisosData] = await Promise.all([
          usuarioService.getRoles(),
          usuarioService.getSucursales(),
          usuarioService.getPermisos(),
        ])
        if (!isMounted) return
        setRoles(rolesData)
        setSucursales(sucursalesData)
        setPermisos(permisosData)
      } catch {
        if (isMounted) {
          setFeedbackError('No se pudieron cargar los catálogos de selección.')
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
  }, [setFeedbackError, setIsLoadingCatalogs, setPermisos, setRoles, setSucursales])

  const crearRol = useCallback(
    async (nombreRol: string, idPermisos: number[]): Promise<Rol> => {
      const rol = await usuarioService.createRol(nombreRol)
      if (idPermisos.length > 0) {
        await Promise.all(
          idPermisos.map((idPermiso) => usuarioService.createRolPermiso(rol.idRol, idPermiso)),
        )
      }

      setRoles((prev) => [...prev, rol])
      setSelectedRoles((prev) => {
        const next = new Set(prev)
        next.add(rol.idRol)
        return next
      })

      return rol
    },
    [setRoles, setSelectedRoles],
  )

  const validateStep = useCallback(
    (currentStep: number): boolean => {
      const validation =
        currentStep === 1
          ? validarInformacionUsuario(formData, {
              passwordRequired: true,
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
      passwordRequired: true,
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

      const idRoles = Array.from(selectedRoles)

      const creado = await usuarioService.create({
        nombreUsuario: formData.nombreUsuario.trim(),
        apellidoUsuario: formData.apellidoUsuario.trim(),
        correoUsuario: formData.correoUsuario.trim(),
        passwordUsuario: formData.passwordUsuario,
        idRoles,
      })

      await Promise.all(
        Array.from(selectedSucursales).map((idSucursal) =>
          usuarioService.assignSucursal(creado.idUsuario, idSucursal),
        ),
      )

      setIsSuccess(true)
      if (onSuccess) {
        onSuccess()
      }
      return true
    } catch (err) {
      console.error('Error al crear usuario:', err)
      setFeedbackError(extractUsuarioErrorMessage(err, 'create'))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { ...form, crearRol, handleSubmit, validateStep }
}
