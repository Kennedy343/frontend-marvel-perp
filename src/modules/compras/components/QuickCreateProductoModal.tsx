import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import { Toaster } from '../../../components/ui/sonner'
import QuickCreateCategoria from '../../inventario/components/QuickCreateCategoria'
import MultiSelectField, {
  type MultiSelectOption,
} from '../../../components/common/MultiSelectField'
import { productoService } from '../../inventario/services/productoService'
import { categoriaService } from '../../inventario/services/categoriaService'
import type { CategoriaProducto } from '../../inventario/types/categoria'
import type { Producto } from '../../inventario/types/producto'

const MODAL_TOASTER_ID = 'quick-create-producto'

interface QuickCreateProductoModalProps {
  open: boolean
  initialNameOrCode?: string
  onClose: () => void
  onSuccess: (created: Producto) => void
}

export default function QuickCreateProductoModal({
  open,
  initialNameOrCode = '',
  onClose,
  onSuccess,
}: QuickCreateProductoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [codigoProducto, setCodigoProducto] = useState('')
  const [nombreProducto, setNombreProducto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState<number[]>([])
  const [availableCategorias, setAvailableCategorias] = useState<CategoriaProducto[]>([])
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false)
  const [errors, setErrors] = useState<{ codigo?: string; nombre?: string; categorias?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [isCreatingCategoria, setIsCreatingCategoria] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      const queryTrimmed = initialNameOrCode.trim()
      // Si parece código (contiene números o guiones y es corto) se asigna a código, sino a nombre
      if (/^[A-Za-z0-9-_]{2,15}$/.test(queryTrimmed)) {
        setCodigoProducto(queryTrimmed.toUpperCase())
        setNombreProducto('')
      } else {
        setNombreProducto(queryTrimmed)
        setCodigoProducto('')
      }
      setDescripcion('')
      setCategorias([])
      setErrors({})
      setFeedbackError(null)
      setIsCreatingCategoria(false)
    }
  }

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
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    let isMounted = true

    async function loadCategorias() {
      try {
        setIsLoadingCategorias(true)
        const response = await categoriaService.getAll({ limit: 100 })
        if (isMounted) {
          setAvailableCategorias(response.data.filter((c) => c.activo))
        }
      } catch (err) {
        console.error('Error al cargar categorías en modal:', err)
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
  }, [open])

  const categoriaOptions = useMemo<MultiSelectOption[]>(
    () =>
      availableCategorias.map((categoria) => ({
        value: categoria.idCategoria,
        label: categoria.nombreCategoria,
      })),
    [availableCategorias],
  )

  const handleCategoriaCreated = useCallback((categoria: CategoriaProducto) => {
    setAvailableCategorias((prev) => [...prev, categoria])
    setCategorias((prev) =>
      prev.includes(categoria.idCategoria) ? prev : [...prev, categoria.idCategoria],
    )
    setErrors((prev) => (prev.categorias ? { ...prev, categorias: undefined } : prev))
    setIsCreatingCategoria(false)
  }, [])

  const validate = () => {
    const newErrors: { codigo?: string; nombre?: string; categorias?: string } = {}
    if (!codigoProducto.trim()) {
      newErrors.codigo = 'El código es obligatorio.'
    }
    if (!nombreProducto.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.'
    }
    if (categorias.length === 0) {
      newErrors.categorias = 'Seleccione al menos una categoría.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.warning('Completa los campos obligatorios para crear el producto.', {
        toasterId: MODAL_TOASTER_ID,
      })
      return
    }

    try {
      setIsSubmitting(true)
      setFeedbackError(null)

      const created = await productoService.create({
        codigoProducto: codigoProducto.trim().toUpperCase(),
        nombreProducto: nombreProducto.trim(),
        descripcion: descripcion.trim() || undefined,
        activo: true,
        categorias,
      })

      onSuccess(created)
      onClose()
    } catch (err: unknown) {
      console.error('Error al crear producto rápido:', err)
      setFeedbackError('No se pudo registrar el producto. Verifique que el código no esté duplicado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="quick-create-producto-title"
      className="m-auto backdrop:bg-navy-950/40 backdrop:backdrop-blur-xs w-full max-w-lg rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xl open:animate-rise"
    >
      <Toaster id={MODAL_TOASTER_ID} position="top-center" />
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-inventory" className="size-4" />
          </span>
          <h3 id="quick-create-producto-title" className="font-sora text-base font-semibold text-navy-950">Nuevo Producto</h3>
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

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor="quickCodigo" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Código <span className="text-error-red">*</span>
          </label>
          <input
            id="quickCodigo"
            type="text"
            value={codigoProducto}
            onChange={(e) => {
              setCodigoProducto(e.target.value.toUpperCase())
              if (errors.codigo) setErrors((prev) => ({ ...prev, codigo: undefined }))
            }}
            placeholder="Ej. PROD-101"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-navy-950 focus:border-primary-blue focus:outline-none"
          />
          {errors.codigo && <p className="mt-1 text-xs text-error-red">{errors.codigo}</p>}
        </div>

        <div>
          <label htmlFor="quickNombre" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Nombre del Producto <span className="text-error-red">*</span>
          </label>
          <input
            id="quickNombre"
            type="text"
            value={nombreProducto}
            onChange={(e) => {
              setNombreProducto(e.target.value)
              if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }))
            }}
            placeholder="Ej. Nombre del producto"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-navy-950 focus:border-primary-blue focus:outline-none"
          />
          {errors.nombre && <p className="mt-1 text-xs text-error-red">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="quickDescripcion" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
            Descripción <span className="text-xs font-normal text-gray-400">(Opcional)</span>
          </label>
          <textarea
            id="quickDescripcion"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Detalles breves del producto…"
            className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 font-dm-sans text-sm text-navy-950 focus:border-primary-blue focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Categorías <span className="text-error-red">*</span>
            </span>
            {!isCreatingCategoria && (
              <button
                type="button"
                onClick={() => setIsCreatingCategoria(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="icon-plus" className="size-3.5" />
                Nueva categoría
              </button>
            )}
          </div>
          <div className="mt-1.5">
            <MultiSelectField
              id="quickCategorias"
              ariaLabel="Categorías"
              items={categoriaOptions}
              selectedIds={categorias}
              onChange={setCategorias}
              placeholder={
                isLoadingCategorias
                  ? 'Cargando categorías…'
                  : 'Buscar y asignar categorías…'
              }
              emptyLabel="No se encontraron categorías."
              disabled={isSubmitting}
              invalid={Boolean(errors.categorias)}
              portalContainer={dialogRef}
            />
          </div>
          {isCreatingCategoria && (
            <QuickCreateCategoria
              onCreated={handleCategoriaCreated}
              onCancel={() => setIsCreatingCategoria(false)}
              disabled={isSubmitting}
            />
          )}
          {errors.categorias ? (
            <p role="alert" className="mt-1 text-xs font-medium text-error-red">
              {errors.categorias}
            </p>
          ) : null}
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
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-4 py-2 font-dm-sans text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Icon name="icon-check" className="size-3.5" />
            <span>{isSubmitting ? 'Guardando…' : 'Guardar y Seleccionar'}</span>
          </button>
        </div>
      </form>
    </dialog>
  )
}
