import { isAxiosError } from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSucursalScope } from '../../../hooks/useSucursalScope'
import { clientService } from '../services/clientService'
import type { CatalogoKind } from '../lib/catalogos'
import type {
  CategoriaCliente,
  Client,
  ClientFormData,
  ClientFormErrors,
  Comunidad,
  CreateClientPayload,
  Departamento,
  Municipio,
  Sector,
  SucursalOption,
} from '../types/client'

export type ClientFormMode = 'create' | 'edit'

const initialFormData: ClientFormData = {
  dpiCliente: '',
  nit: 'C/F',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  telefono: '',
  idDepartamento: '',
  idMunicipio: '',
  idSector: '',
  idComunidad: '',
  idCategoria: '',
}

const REQUIRED_FIELDS: (keyof ClientFormData)[] = [
  'dpiCliente',
  'primerNombre',
  'primerApellido',
  'telefono',
  'idDepartamento',
  'idMunicipio',
  'idComunidad',
  'idCategoria',
]

function extractErrorMessage(error: unknown, mode: ClientFormMode): string {
  const action = mode === 'edit' ? 'actualizar' : 'registrar'
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
    if (error.response?.status === 404) {
      return mode === 'edit'
        ? 'El cliente no fue encontrado en el servidor (404).'
        : 'El endpoint /clientes no fue encontrado en el servidor (404).'
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
  return `Ocurrió un error inesperado al ${action} el cliente.`
}

function validateClientForm(formData: ClientFormData): ClientFormErrors {
  const newErrors: ClientFormErrors = {}

  const cleanDpi = formData.dpiCliente.replace(/\s+/g, '')
  if (!cleanDpi) {
    newErrors.dpiCliente = 'El DPI es obligatorio.'
  } else if (!/^\d{13}$/.test(cleanDpi)) {
    newErrors.dpiCliente = 'El DPI debe contener exactamente 13 dígitos.'
  }

  if (!formData.primerNombre.trim()) newErrors.primerNombre = 'El primer nombre es obligatorio.'
  if (!formData.primerApellido.trim()) newErrors.primerApellido = 'El primer apellido es obligatorio.'
  if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono principal es obligatorio.'
  if (!formData.idDepartamento) newErrors.idDepartamento = 'Debe seleccionar un departamento.'
  if (!formData.idMunicipio) newErrors.idMunicipio = 'Debe seleccionar un municipio.'
  if (!formData.idComunidad) newErrors.idComunidad = 'Debe seleccionar una comunidad.'
  if (!formData.idCategoria) newErrors.idCategoria = 'Debe seleccionar una categoría.'

  return newErrors
}

function validateClientField(formData: ClientFormData, field: keyof ClientFormData): string | undefined {
  switch (field) {
    case 'dpiCliente': {
      const cleanDpi = formData.dpiCliente.replace(/\s+/g, '')
      if (!cleanDpi) return 'El DPI es obligatorio.'
      if (!/^\d{13}$/.test(cleanDpi)) return 'El DPI debe contener exactamente 13 dígitos.'
      return undefined
    }
    case 'primerNombre':
      return formData.primerNombre.trim() ? undefined : 'El primer nombre es obligatorio.'
    case 'primerApellido':
      return formData.primerApellido.trim() ? undefined : 'El primer apellido es obligatorio.'
    case 'telefono':
      return formData.telefono.trim() ? undefined : 'El teléfono principal es obligatorio.'
    case 'idDepartamento':
      return formData.idDepartamento ? undefined : 'Debe seleccionar un departamento.'
    case 'idMunicipio':
      return formData.idMunicipio ? undefined : 'Debe seleccionar un municipio.'
    case 'idComunidad':
      return formData.idComunidad ? undefined : 'Debe seleccionar una comunidad.'
    case 'idCategoria':
      return formData.idCategoria ? undefined : 'Debe seleccionar una categoría.'
    default:
      return undefined
  }
}

function mergeMunicipios(departamentos: Departamento[], municipios: Municipio[]): Municipio[] {
  if (municipios.length > 0) return municipios
  return departamentos.flatMap((departamento) =>
    (departamento.municipio ?? []).map((municipio) => ({
      ...municipio,
      idDepartamento: municipio.idDepartamento || departamento.idDepartamento,
    })),
  )
}

function mapClientToForm(
  client: Client,
  comunidades: Comunidad[],
  municipios: Municipio[],
): ClientFormData {
  const idComunidadVal = client.comunidad?.idComunidad || client.comunidad?.id || ''
  let idMunicipioVal = ''
  let idDepartamentoVal = ''

  if (idComunidadVal) {
    const comMatch = comunidades.find((c) => String(c.idComunidad) === String(idComunidadVal))
    if (comMatch) {
      idMunicipioVal = String(comMatch.idMunicipio || comMatch.municipio?.idMunicipio || '')
    }
  }

  if (idMunicipioVal) {
    const munMatch = municipios.find((m) => String(m.idMunicipio) === String(idMunicipioVal))
    if (munMatch) {
      idDepartamentoVal = String(munMatch.idDepartamento || munMatch.departamento?.idDepartamento || '')
    }
  }

  const idSectorVal = client.sector?.idSector || client.sector?.id || ''
  const idCategoriaVal = client.categoria?.idCategoria || client.categoria?.id || ''

  return {
    dpiCliente: client.dpiCliente || '',
    nit: client.nit || 'C/F',
    primerNombre: client.primerNombre || '',
    segundoNombre: client.segundoNombre || '',
    primerApellido: client.primerApellido || '',
    segundoApellido: client.segundoApellido || '',
    telefono: client.telefono || '',
    idDepartamento: idDepartamentoVal,
    idMunicipio: idMunicipioVal,
    idSector: idSectorVal ? String(idSectorVal) : '',
    idComunidad: idComunidadVal ? String(idComunidadVal) : '',
    idCategoria: idCategoriaVal ? String(idCategoriaVal) : '',
  }
}

function buildPayload(formData: ClientFormData, idSucursal: number): CreateClientPayload {
  return {
    dpiCliente: formData.dpiCliente.trim().replace(/\s+/g, ''),
    nit: formData.nit.trim() || 'C/F',
    primerNombre: formData.primerNombre.trim(),
    segundoNombre: formData.segundoNombre.trim() || undefined,
    primerApellido: formData.primerApellido.trim(),
    segundoApellido: formData.segundoApellido.trim() || undefined,
    telefono: formData.telefono.trim() || undefined,
    idSector: formData.idSector ? Number(formData.idSector) : undefined,
    idComunidad: Number(formData.idComunidad),
    idCategoria: Number(formData.idCategoria),
    idSucursal,
  }
}

export function useClientForm(idCliente?: number | string) {
  const { sucursalFija, mode: sucursalMode, sucursalesPropias } = useSucursalScope()
  const needsSucursalSelection = !sucursalFija
  const isEdit = idCliente !== undefined && idCliente !== '' && !Number.isNaN(Number(idCliente))

  const [client, setClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<ClientFormData>(initialFormData)
  const [errors, setErrors] = useState<ClientFormErrors>({})
  const [sectores, setSectores] = useState<Sector[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [comunidades, setComunidades] = useState<Comunidad[]>([])
  const [categorias, setCategorias] = useState<CategoriaCliente[]>([])
  const [sucursales, setSucursales] = useState<SucursalOption[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState('')
  const [sucursalError, setSucursalError] = useState<string | undefined>(undefined)
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setIsLoadingCatalogs(true)
        const [
          sectoresData,
          departamentosData,
          municipiosData,
          comunidadesData,
          categoriasData,
          clientData,
        ] = await Promise.all([
          clientService.getSectores(),
          clientService.getDepartamentos(),
          clientService.getMunicipios(),
          clientService.getComunidades(),
          clientService.getCategorias(),
          isEdit ? clientService.getById(idCliente as number | string) : Promise.resolve(null),
        ])

        if (!isMounted) return

        const allMunicipios = mergeMunicipios(departamentosData, municipiosData)

        setSectores(sectoresData)
        setDepartamentos(departamentosData)
        setMunicipios(allMunicipios)
        setComunidades(comunidadesData)
        setCategorias(categoriasData)

        if (clientData) {
          setClient(clientData)
          setFormData(mapClientToForm(clientData, comunidadesData, allMunicipios))
          setSelectedSucursal(String(clientData.sucursal?.idSucursal ?? ''))
        }
      } catch (err) {
        console.error('Error al cargar datos del cliente:', err)
        if (isMounted) {
          setFeedbackError(
            isEdit
              ? 'No se pudieron cargar los datos del cliente.'
              : 'No se pudieron cargar los catálogos de selección.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalogs(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [idCliente, isEdit])

  useEffect(() => {
    if (!needsSucursalSelection) return
    let isMounted = true

    async function loadSucursales() {
      const data =
        sucursalMode === 'select-todas'
          ? await clientService.getSucursales()
          : sucursalesPropias
      if (!isMounted) return
      setSucursales(data)
    }

    loadSucursales()

    return () => {
      isMounted = false
    }
  }, [needsSucursalSelection, sucursalMode, sucursalesPropias])

  const handleChange = useCallback((field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const handleBlur = useCallback(
    (field: keyof ClientFormData) => {
      const message = validateClientField(formData, field)
      setErrors((prev) => ({ ...prev, [field]: message }))
    },
    [formData],
  )

  const handleSectorChange = useCallback((sectorId: string) => {
    setFormData((prev) => ({ ...prev, idSector: sectorId }))
    setErrors((prev) => (prev.idSector ? { ...prev, idSector: undefined } : prev))
    setFeedbackError(null)
  }, [])

  const handleSucursalChange = useCallback((idSucursal: string) => {
    setSelectedSucursal(idSucursal)
    setSucursalError(undefined)
    setFeedbackError(null)
  }, [])

  const resetLocationErrors = useCallback(() => {
    setErrors((prev) => ({
      ...prev,
      idDepartamento: undefined,
      idMunicipio: undefined,
      idComunidad: undefined,
    }))
  }, [])

  const handleDepartamentoChange = useCallback(
    (idDepartamento: string) => {
      setFormData((prev) => ({ ...prev, idDepartamento, idMunicipio: '', idComunidad: '' }))
      resetLocationErrors()
      setFeedbackError(null)
    },
    [resetLocationErrors],
  )

  const handleMunicipioChange = useCallback((idMunicipio: string) => {
    setFormData((prev) => ({ ...prev, idMunicipio, idComunidad: '' }))
    setErrors((prev) => ({ ...prev, idMunicipio: undefined, idComunidad: undefined }))
    setFeedbackError(null)
  }, [])

  const addCatalogo = useCallback((kind: CatalogoKind, created: unknown) => {
    if (kind === 'departamento') {
      const item = created as Departamento
      setDepartamentos((prev) =>
        prev.some((x) => x.idDepartamento === item.idDepartamento) ? prev : [...prev, item],
      )
      setFormData((prev) => ({
        ...prev,
        idDepartamento: String(item.idDepartamento),
        idMunicipio: '',
        idComunidad: '',
      }))
      setErrors((prev) => ({
        ...prev,
        idDepartamento: undefined,
        idMunicipio: undefined,
        idComunidad: undefined,
      }))
    } else if (kind === 'municipio') {
      const item = created as Municipio
      setMunicipios((prev) =>
        prev.some((x) => x.idMunicipio === item.idMunicipio) ? prev : [...prev, item],
      )
      setFormData((prev) => ({ ...prev, idMunicipio: String(item.idMunicipio), idComunidad: '' }))
      setErrors((prev) => ({ ...prev, idMunicipio: undefined, idComunidad: undefined }))
    } else if (kind === 'comunidad') {
      const item = created as Comunidad
      setComunidades((prev) =>
        prev.some((x) => x.idComunidad === item.idComunidad) ? prev : [...prev, item],
      )
      setFormData((prev) => ({ ...prev, idComunidad: String(item.idComunidad) }))
      setErrors((prev) => ({ ...prev, idComunidad: undefined }))
    } else if (kind === 'sector') {
      const item = created as Sector
      setSectores((prev) => (prev.some((x) => x.idSector === item.idSector) ? prev : [...prev, item]))
      setFormData((prev) => ({ ...prev, idSector: String(item.idSector) }))
      setErrors((prev) => ({ ...prev, idSector: undefined }))
    } else {
      const item = created as CategoriaCliente
      setCategorias((prev) =>
        prev.some((x) => x.idCategoria === item.idCategoria) ? prev : [...prev, item],
      )
      setFormData((prev) => ({ ...prev, idCategoria: String(item.idCategoria) }))
      setErrors((prev) => ({ ...prev, idCategoria: undefined }))
    }
    setFeedbackError(null)
  }, [])

  const requiredFieldsFilled = useMemo(
    () =>
      REQUIRED_FIELDS.reduce((count, field) => (formData[field].trim() ? count + 1 : count), 0) +
      (needsSucursalSelection && selectedSucursal ? 1 : 0),
    [formData, needsSucursalSelection, selectedSucursal],
  )

  const requiredFieldsTotal = REQUIRED_FIELDS.length + (needsSucursalSelection ? 1 : 0)

  const handleSubmit = useCallback(
    async (onSuccess?: () => void) => {
      const validationErrors = validateClientForm(formData)
      const missingSucursal = needsSucursalSelection && !selectedSucursal
      if (Object.keys(validationErrors).length > 0 || missingSucursal) {
        setErrors(validationErrors)
        setSucursalError(missingSucursal ? 'Debe seleccionar una sucursal.' : undefined)
        setFeedbackError('Por favor complete todos los campos obligatorios correctamente.')
        const firstInvalid = REQUIRED_FIELDS.find((field) => validationErrors[field])
        const focusTarget = firstInvalid ?? (missingSucursal ? 'idSucursal' : undefined)
        if (focusTarget) {
          requestAnimationFrame(() => document.getElementById(focusTarget)?.focus())
        }
        return false
      }

      const idSucursal =
        sucursalFija?.idSucursal ??
        (selectedSucursal ? Number(selectedSucursal) : undefined) ??
        client?.sucursal?.idSucursal

      if (!idSucursal) {
        setSucursalError('Debe seleccionar una sucursal.')
        setFeedbackError('No se pudo determinar la sucursal del cliente.')
        return false
      }

      try {
        setIsSubmitting(true)
        setFeedbackError(null)

        const payload = buildPayload(formData, idSucursal)

        if (isEdit) {
          await clientService.update(idCliente as number | string, payload)
        } else {
          await clientService.create(payload)
        }
        setIsSuccess(true)
        onSuccess?.()
        return true
      } catch (err) {
        console.error(`Error al ${isEdit ? 'actualizar' : 'crear'} cliente:`, err)
        setFeedbackError(extractErrorMessage(err, isEdit ? 'edit' : 'create'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [client, formData, idCliente, isEdit, needsSucursalSelection, selectedSucursal, sucursalFija],
  )

  return {
    mode: (isEdit ? 'edit' : 'create') as ClientFormMode,
    client,
    formData,
    errors,
    sectores,
    departamentos,
    municipios,
    comunidades,
    categorias,
    isLoadingCatalogs,
    isSubmitting,
    isSuccess,
    feedbackError,
    sucursales,
    selectedSucursal,
    sucursalError,
    needsSucursalSelection,
    requiredFieldsFilled,
    requiredFieldsTotal,
    handleChange,
    handleBlur,
    handleSectorChange,
    handleSucursalChange,
    handleDepartamentoChange,
    handleMunicipioChange,
    addCatalogo,
    handleSubmit,
  }
}

export type UseClientFormResult = ReturnType<typeof useClientForm>
