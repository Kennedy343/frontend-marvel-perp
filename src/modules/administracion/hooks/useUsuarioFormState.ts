import { useCallback, useMemo, useState } from 'react'
import { agruparPermisosEnModulos } from '../lib/permisosModulos'
import { EMPTY_USUARIO_FORM } from '../lib/usuarioForm'
import type {
  Permiso,
  PermisoModulo,
  Rol,
  Sucursal,
  UsuarioInfoErrors,
  UsuarioInfoForm,
} from '../types/usuario'

// Estado y mutaciones compartidos por los formularios de crear/editar usuario.
export function useUsuarioFormState() {
  const [formData, setFormData] = useState<UsuarioInfoForm>(EMPTY_USUARIO_FORM)
  const [errors, setErrors] = useState<UsuarioInfoErrors>({})
  const [roles, setRoles] = useState<Rol[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set())
  const [selectedSucursales, setSelectedSucursales] = useState<Set<number>>(new Set())
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const modulos: PermisoModulo[] = useMemo(
    () => agruparPermisosEnModulos(permisos),
    [permisos],
  )

  const handleChange = useCallback((field: keyof UsuarioInfoForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const setRolesSelection = useCallback((idRoles: number[]) => {
    setSelectedRoles(new Set(idRoles))
    setErrors((prev) => (prev.idRoles ? { ...prev, idRoles: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const setSucursalesSelection = useCallback((idsSucursales: number[]) => {
    setSelectedSucursales(new Set(idsSucursales))
    setErrors((prev) => (prev.sucursales ? { ...prev, sucursales: undefined } : prev))
    setFeedbackError(null)
  }, [])

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    roles,
    setRoles,
    sucursales,
    setSucursales,
    permisos,
    setPermisos,
    selectedRoles,
    setSelectedRoles,
    selectedSucursales,
    setSelectedSucursales,
    isLoadingCatalogs,
    setIsLoadingCatalogs,
    isSubmitting,
    setIsSubmitting,
    isSuccess,
    setIsSuccess,
    feedbackError,
    setFeedbackError,
    modulos,
    handleChange,
    setRolesSelection,
    setSucursalesSelection,
  }
}
