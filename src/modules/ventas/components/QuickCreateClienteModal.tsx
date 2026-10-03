import { useEffect, useEffectEvent, useReducer, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import { Toaster } from '../../../components/ui/sonner'
import { clientService } from '../../crm/services/clientService'
import { useActiveSucursal } from '../../../hooks/useSucursalScope'
import type {
  CategoriaCliente,
  Client,
  Comunidad,
  Departamento,
  Municipio,
  Sector,
} from '../../crm/types/client'

const MODAL_TOASTER_ID = 'quick-create-cliente'

interface QuickCreateClienteModalProps {
  idSucursal?: number
  onClose: () => void
  onSuccess: (created: Client) => void
}

interface QuickForm {
  dpiCliente: string
  nit: string
  primerNombre: string
  segundoNombre: string
  primerApellido: string
  segundoApellido: string
  telefono: string
  idDepartamento: string
  idMunicipio: string
  idSector: string
  idComunidad: string
  idCategoria: string
}

const initialForm: QuickForm = {
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

type QuickErrors = Partial<Record<keyof QuickForm, string>>

type CatalogsState = {
  sectores: Sector[]
  departamentos: Departamento[]
  municipios: Municipio[]
  comunidades: Comunidad[]
  categorias: CategoriaCliente[]
  isLoading: boolean
}

const initialCatalogs: CatalogsState = {
  sectores: [],
  departamentos: [],
  municipios: [],
  comunidades: [],
  categorias: [],
  isLoading: false,
}

type CatalogsAction =
  | { type: 'loading' }
  | {
      type: 'loaded'
      sectores: Sector[]
      departamentos: Departamento[]
      municipios: Municipio[]
      comunidades: Comunidad[]
      categorias: CategoriaCliente[]
    }
  | { type: 'error' }

function catalogsReducer(state: CatalogsState, action: CatalogsAction): CatalogsState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true }
    case 'loaded':
      return { ...state, isLoading: false, ...action }
    case 'error':
      return { ...state, isLoading: false }
  }
}

export default function QuickCreateClienteModal({
  idSucursal,
  onClose,
  onSuccess,
}: QuickCreateClienteModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const activeSucursal = useActiveSucursal()
  const resolvedSucursalId = idSucursal ?? activeSucursal?.idSucursal
  const [form, setForm] = useState<QuickForm>(initialForm)
  const [errors, setErrors] = useState<QuickErrors>({})
  const [catalogs, dispatchCatalogs] = useReducer(catalogsReducer, initialCatalogs)
  const { sectores, departamentos, municipios, comunidades, categorias, isLoading: isLoadingCatalogs } = catalogs
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const handleClose = useEffectEvent(() => {
    if (!isSubmitting) onClose()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      handleClose()
    }
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) handleClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadCatalogs() {
      try {
        dispatchCatalogs({ type: 'loading' })
        const [sectoresData, departamentosData, municipiosData, comunidadesData, categoriasData] =
          await Promise.all([
            clientService.getSectores(),
            clientService.getDepartamentos(),
            clientService.getMunicipios(),
            clientService.getComunidades(),
            clientService.getCategorias(),
          ])
        if (!isMounted) return
        const nestedMunicipios = departamentosData.flatMap((departamento) =>
          (departamento.municipio ?? []).map((municipio) => ({
            ...municipio,
            idDepartamento: municipio.idDepartamento || departamento.idDepartamento,
          })),
        )
        dispatchCatalogs({
          type: 'loaded',
          sectores: sectoresData,
          departamentos: departamentosData,
          municipios: municipiosData.length > 0 ? municipiosData : nestedMunicipios,
          comunidades: comunidadesData,
          categorias: categoriasData,
        })
      } catch {
        if (isMounted) {
          dispatchCatalogs({ type: 'error' })
          setFeedbackError('No se pudieron cargar los catálogos de selección.')
        }
      }
    }

    loadCatalogs()
    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (field: keyof QuickForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
    setFeedbackError(null)
  }

  const handleDepartamentoChange = (idDepartamento: string) => {
    setForm((prev) => ({ ...prev, idDepartamento, idMunicipio: '', idComunidad: '' }))
    setErrors((prev) => ({ ...prev, idDepartamento: undefined, idMunicipio: undefined, idComunidad: undefined }))
    setFeedbackError(null)
  }

  const handleMunicipioChange = (idMunicipio: string) => {
    setForm((prev) => ({ ...prev, idMunicipio, idComunidad: '' }))
    setErrors((prev) => ({ ...prev, idMunicipio: undefined, idComunidad: undefined }))
    setFeedbackError(null)
  }

  const validate = (): boolean => {
    const newErrors: QuickErrors = {}
    const cleanDpi = form.dpiCliente.replace(/\s+/g, '')
    if (!cleanDpi) {
      newErrors.dpiCliente = 'El DPI es obligatorio.'
    } else if (!/^\d{13}$/.test(cleanDpi)) {
      newErrors.dpiCliente = 'El DPI debe contener exactamente 13 dígitos.'
    }
    if (!form.primerNombre.trim()) newErrors.primerNombre = 'El primer nombre es obligatorio.'
    if (!form.primerApellido.trim()) newErrors.primerApellido = 'El primer apellido es obligatorio.'
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono principal es obligatorio.'
    if (!form.idDepartamento) newErrors.idDepartamento = 'Debe seleccionar un departamento.'
    if (!form.idMunicipio) newErrors.idMunicipio = 'Debe seleccionar un municipio.'
    if (!form.idComunidad) newErrors.idComunidad = 'Debe seleccionar una comunidad.'
    if (!form.idCategoria) newErrors.idCategoria = 'Debe seleccionar una categoría.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!validate()) {
      toast.warning('Completa los campos obligatorios para crear el cliente.', {
        toasterId: MODAL_TOASTER_ID,
      })
      return
    }

    if (!resolvedSucursalId) {
      setFeedbackError('Seleccione una sucursal de despacho antes de crear el cliente.')
      return
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)
      const created = await clientService.create({
        dpiCliente: form.dpiCliente.trim().replace(/\s+/g, ''),
        nit: form.nit.trim() || 'C/F',
        primerNombre: form.primerNombre.trim(),
        segundoNombre: form.segundoNombre.trim() || undefined,
        primerApellido: form.primerApellido.trim(),
        segundoApellido: form.segundoApellido.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        idSector: form.idSector ? Number(form.idSector) : 1,
        idComunidad: Number(form.idComunidad),
        idCategoria: Number(form.idCategoria),
        idSucursal: resolvedSucursalId,
      })
      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      console.error('Error al crear cliente rápido:', err)
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message
        if (typeof msg === 'string') {
          setFeedbackError(msg)
        } else if (Array.isArray(msg)) {
          setFeedbackError(msg.join('. '))
        } else {
          setFeedbackError('No se pudo registrar el cliente. Verifique que el DPI no esté duplicado.')
        }
      } else {
        setFeedbackError('No se pudo registrar el cliente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-white px-3 py-2 font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
      hasError
        ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
        : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
    }`

  const selectClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-white py-2 px-3 font-dm-sans text-sm text-gray-900 outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
      hasError
        ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
        : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
    }`

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="quick-create-cliente-title"
      className="m-auto w-full max-w-lg rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs open:animate-rise"
    >
      <Toaster id={MODAL_TOASTER_ID} position="top-center" />
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-user" className="size-4" />
          </span>
          <h3 id="quick-create-cliente-title" className="font-sora text-base font-semibold text-navy-950">Nuevo Cliente</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar modal"
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-close" className="size-4" />
        </button>
      </div>

      {feedbackError && (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-error-red">
          {feedbackError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quickClienteDpi" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              DPI <span className="text-error-red">*</span>
            </label>
            <input
              id="quickClienteDpi"
              type="text"
              inputMode="numeric"
              maxLength={13}
              value={form.dpiCliente}
              onChange={(e) => handleChange('dpiCliente', e.target.value.replace(/\D/g, ''))}
              placeholder="13 dígitos"
              disabled={isSubmitting}
              className={`mt-1 ${inputClass(Boolean(errors.dpiCliente))}`}
            />
            {errors.dpiCliente && <p className="mt-1 text-xs text-error-red">{errors.dpiCliente}</p>}
          </div>
          <div>
            <label htmlFor="quickClienteNit" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              NIT
            </label>
            <input
              id="quickClienteNit"
              type="text"
              value={form.nit}
              onChange={(e) => handleChange('nit', e.target.value.toUpperCase())}
              placeholder="C/F"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-gray-900 focus:border-primary-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quickClienteNombre" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Primer Nombre <span className="text-error-red">*</span>
            </label>
            <input
              id="quickClienteNombre"
              type="text"
              value={form.primerNombre}
              onChange={(e) => handleChange('primerNombre', e.target.value)}
              placeholder="Ej. Juan"
              disabled={isSubmitting}
              className={`mt-1 ${inputClass(Boolean(errors.primerNombre))}`}
            />
            {errors.primerNombre && <p className="mt-1 text-xs text-error-red">{errors.primerNombre}</p>}
          </div>
          <div>
            <label htmlFor="quickClienteSegNombre" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Segundo Nombre
            </label>
            <input
              id="quickClienteSegNombre"
              type="text"
              value={form.segundoNombre}
              onChange={(e) => handleChange('segundoNombre', e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-gray-900 focus:border-primary-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quickClienteApellido" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Primer Apellido <span className="text-error-red">*</span>
            </label>
            <input
              id="quickClienteApellido"
              type="text"
              value={form.primerApellido}
              onChange={(e) => handleChange('primerApellido', e.target.value)}
              placeholder="Ej. Pérez"
              disabled={isSubmitting}
              className={`mt-1 ${inputClass(Boolean(errors.primerApellido))}`}
            />
            {errors.primerApellido && <p className="mt-1 text-xs text-error-red">{errors.primerApellido}</p>}
          </div>
          <div>
            <label htmlFor="quickClienteSegApellido" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Segundo Apellido
            </label>
            <input
              id="quickClienteSegApellido"
              type="text"
              value={form.segundoApellido}
              onChange={(e) => handleChange('segundoApellido', e.target.value)}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-gray-900 focus:border-primary-blue focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quickClienteTelefono" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Teléfono Principal <span className="text-error-red">*</span>
          </label>
          <input
            id="quickClienteTelefono"
            type="tel"
            value={form.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="0000-0000"
            disabled={isSubmitting}
            className={`mt-1 ${inputClass(Boolean(errors.telefono))}`}
          />
          {errors.telefono && <p className="mt-1 text-xs text-error-red">{errors.telefono}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quickClienteDepto" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Departamento <span className="text-error-red">*</span>
            </label>
            <select
              id="quickClienteDepto"
              value={form.idDepartamento}
              onChange={(e) => handleDepartamentoChange(e.target.value)}
              disabled={isSubmitting || isLoadingCatalogs}
              className={`mt-1 ${selectClass(Boolean(errors.idDepartamento))}`}
            >
              <option value="">Seleccione…</option>
              {departamentos.map((item) => (
                <option key={item.idDepartamento} value={item.idDepartamento}>
                  {item.nombreDepartamento}
                </option>
              ))}
            </select>
            {errors.idDepartamento && <p className="mt-1 text-xs text-error-red">{errors.idDepartamento}</p>}
          </div>
          <div>
            <label htmlFor="quickClienteMunicipio" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Municipio <span className="text-error-red">*</span>
            </label>
            <select
              id="quickClienteMunicipio"
              value={form.idMunicipio}
              onChange={(e) => handleMunicipioChange(e.target.value)}
              disabled={isSubmitting || !form.idDepartamento}
              className={`mt-1 ${selectClass(Boolean(errors.idMunicipio))}`}
            >
              <option value="">Seleccione…</option>
              {municipios.reduce((acc: Municipio[], item) => {
                if (String(item.idDepartamento) === form.idDepartamento) acc.push(item)
                return acc
              }, []).map((item) => (
                <option key={item.idMunicipio} value={item.idMunicipio}>
                  {item.nombreMunicipio}
                </option>
              ))}
            </select>
            {errors.idMunicipio && <p className="mt-1 text-xs text-error-red">{errors.idMunicipio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="quickClienteComunidad" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Comunidad <span className="text-error-red">*</span>
            </label>
            <select
              id="quickClienteComunidad"
              value={form.idComunidad}
              onChange={(e) => handleChange('idComunidad', e.target.value)}
              disabled={isSubmitting || !form.idMunicipio}
              className={`mt-1 ${selectClass(Boolean(errors.idComunidad))}`}
            >
              <option value="">Seleccione…</option>
              {comunidades.reduce((acc: Comunidad[], item) => {
                if (String(item.idMunicipio) === form.idMunicipio) acc.push(item)
                return acc
              }, []).map((item) => (
                <option key={item.idComunidad} value={item.idComunidad}>
                  {item.nombreComunidad}
                </option>
              ))}
            </select>
            {errors.idComunidad && <p className="mt-1 text-xs text-error-red">{errors.idComunidad}</p>}
          </div>
          <div>
            <label htmlFor="quickClienteSector" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Sector
            </label>
            <select
              id="quickClienteSector"
              value={form.idSector}
              onChange={(e) => handleChange('idSector', e.target.value)}
              disabled={isSubmitting || isLoadingCatalogs}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white py-2 px-3 font-dm-sans text-sm text-gray-900 focus:border-primary-blue focus:outline-none"
            >
              <option value="">Seleccione…</option>
              {sectores.map((item) => (
                <option key={item.idSector} value={item.idSector}>
                  {item.nombreSector}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quickClienteCategoria" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Categoría <span className="text-error-red">*</span>
            </label>
            <select
              id="quickClienteCategoria"
              value={form.idCategoria}
              onChange={(e) => handleChange('idCategoria', e.target.value)}
              disabled={isSubmitting || isLoadingCatalogs}
              className={`mt-1 ${selectClass(Boolean(errors.idCategoria))}`}
            >
              <option value="">Seleccione…</option>
              {categorias.map((item) => (
                <option key={item.idCategoria} value={item.idCategoria}>
                  {item.nombreCategoria}
                </option>
              ))}
            </select>
            {errors.idCategoria && <p className="mt-1 text-xs text-error-red">{errors.idCategoria}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingCatalogs}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 font-dm-sans text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Icon name="icon-check" className="size-3.5" />
            <span>{isSubmitting ? 'Guardando…' : 'Guardar y Seleccionar'}</span>
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  )
}