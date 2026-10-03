import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import DraftRestoreBanner from '../../../components/common/DraftRestoreBanner'
import CompraHeaderCard from '../components/CompraHeaderCard'
import DetalleCompraCard from '../components/DetalleCompraCard'
import { useCreateCompra } from '../hooks/useCreateCompra'

const STEPS = ['Cabecera', 'Detalles']

function CreateCompraPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const {
    formData,
    headerErrors,
    detalleErrors,
    detalleInput,
    proveedores,
    sucursales,
    productos,
    isLoadingCatalogs,
    isSearchingProductos,
    isSubmitting,
    isSuccess,
    feedbackError,
    draftRestoredAt,
    discardDraft,
    handleChange,
    handleDetalleInputChange,
    handleMargenChange,
    handleProductoSearchChange,
    handleSelectProducto,
    appendProducto,
    agregarDetalle,
    quitarDetalle,
    updateDetalle,
    validateHeader,
    handleSubmit,
  } = useCreateCompra()

  const handleCancel = () => {
    navigate('/compras')
  }

  const onNext = () => {
    if (step !== 1) return
    if (!validateHeader()) {
      toast.warning('Completa los campos obligatorios de la cabecera antes de continuar.')
      return
    }
    setStep(2)
  }

  const onBack = () => {
    setStep(1)
  }

  const onAgregarDetalle = () => {
    if (!agregarDetalle()) {
      toast.warning('Completa los campos obligatorios del producto antes de agregarlo.')
    }
  }

  const onFormSubmit = async () => {
    if (!validateHeader()) {
      toast.warning('Completa los campos obligatorios de la cabecera.')
      setStep(1)
      return
    }
    if (formData.detalles.length === 0) {
      toast.warning('Agrega al menos un producto antes de guardar la compra.')
      return
    }

    const compraRef =
      `${formData.serieFactura.trim()}-${formData.numeroFactura.trim()}`.replace(
        /^-+|-+$/g,
        '',
      )
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-compra',
          loading: 'Registrando compra…',
          success: {
            message: 'Compra creada',
            description: compraRef
              ? `Factura ${compraRef} registrada correctamente.`
              : 'La compra fue registrada correctamente.',
          },
          error: {
            message: 'No se pudo registrar la compra',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/compras'))
      .catch(() => {})
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 motion-safe:animate-rise">
      <div>
        <h1 className="font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Nueva Compra
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          Complete la cabecera de la factura y agregue los productos de la compra.
        </p>
      </div>

      {draftRestoredAt != null && (
        <DraftRestoreBanner savedAt={draftRestoredAt} onDiscard={discardDraft} />
      )}

      {feedbackError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
            <Icon name="icon-close" className="size-4" />
          </div>
          <p>{feedbackError}</p>
        </div>
      )}

      <nav aria-label="Progreso" className="flex items-center gap-3">
        {STEPS.map((label, index) => {
          const number = index + 1
          const active = number === step
          const done = number < step
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? 'bg-primary-blue text-white'
                      : done
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {done ? <Icon name="icon-check" className="size-4" /> : number}
                </span>
                <span className={`text-sm font-medium ${active ? 'text-navy-950' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {number < STEPS.length && <div className="h-px w-8 bg-gray-200" />}
            </div>
          )
        })}
      </nav>

      {step === 1 ? (
        <CompraHeaderCard
          formData={formData}
          errors={headerErrors}
          proveedores={proveedores}
          sucursales={sucursales}
          isLoadingCatalogs={isLoadingCatalogs}
          onChange={handleChange}
          disabled={isSubmitting || isSuccess}
        />
      ) : (
        <DetalleCompraCard
          productos={productos}
          detalles={formData.detalles}
          detalleInput={detalleInput}
          errors={detalleErrors}
          isLoadingCatalogs={isLoadingCatalogs}
          isSearchingProductos={isSearchingProductos}
          onProductoChange={handleSelectProducto}
          onProductoSearch={handleProductoSearchChange}
          onProductoCreated={appendProducto}
          onInputChange={handleDetalleInputChange}
          onMargenChange={handleMargenChange}
          onAgregar={onAgregarDetalle}
          onQuitar={quitarDetalle}
          onUpdateDetalle={updateDetalle}
          disabled={isSubmitting || isSuccess}
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting || isSuccess}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        {step === 1 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting || isSuccess}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
            <Icon name="icon-chevron-down" className="size-4 -rotate-90" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting || isSuccess}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onFormSubmit}
              disabled={isSubmitting || isSuccess}
              className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando compra…' : 'Guardar Compra'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateCompraPage