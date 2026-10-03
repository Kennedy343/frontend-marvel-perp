import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import DraftRestoreBanner from '../../../components/common/DraftRestoreBanner'
import { useAuthStore } from '../../../store/authStore'
import { esAdministrador } from '../../../lib/roles'
import { useCreateVenta } from '../hooks/useCreateVenta'
import { VentaContextBar } from '../components/VentaContextBar'
import { VentaOrderLedger } from '../components/VentaOrderLedger'
import { OrdenBarMovil } from '../components/OrdenBarMovil'

export default function CreateVentaPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = esAdministrador(user)

  const {
    clientes,
    sucursales,
    sucursalMode,
    sucursalFija,
    productos,
    isLoadingCatalogs,
    formData,
    detalleInput,
    detalles,
    totalVenta,
    currentProductStock,
    currentUnitPrice,
    headerErrors,
    detalleErrors,
    isSubmitting,
    feedbackError,
    draftRestoredAt,
    discardDraft,
    handleHeaderChange,
    handleClienteSelect,
    appendCliente,
    clienteSearchTerm,
    setClienteSearchTerm,
    isSearchingClientes,
    setProductoSearchTerm,
    isSearchingProductos,
    handleDetalleInputChange,
    agregarDetalle,
    quitarDetalle,
    actualizarCantidadDetalle,
    actualizarTipoPrecioDetalle,
    handleSubmit,
  } = useCreateVenta()

  const canSubmit =
    detalles.length > 0 && Boolean(formData.idCliente) && Boolean(formData.idSucursal)

  const handleCancel = () => {
    navigate('/ventas')
  }

  const onFormSubmit = useCallback(async () => {
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-venta',
          loading: 'Registrando venta…',
          success: {
            message: 'Venta registrada',
            description: 'La venta se realizó correctamente.',
          },
          error: {
            message: 'No se pudo registrar la venta',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/ventas'))
      .catch(() => {})
  }, [handleSubmit, navigate])

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-28 motion-safe:animate-rise lg:pb-0">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            Nueva Venta
          </h1>
          <p className="mt-1 font-dm-sans text-sm text-gray-500">
            Terminal unificada de despacho: asigne el cliente, agregue productos y confirme la orden.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:opacity-50 sm:self-auto"
        >
          <Icon name="icon-close" className="size-4" />
          <span>Cancelar</span>
        </button>
      </div>

      {draftRestoredAt != null && (
        <DraftRestoreBanner savedAt={draftRestoredAt} onDiscard={discardDraft} />
      )}

      {feedbackError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
            <Icon name="icon-close" className="size-4" />
          </span>
          <p>{feedbackError}</p>
        </div>
      )}

      {/* Ribbon Contextual: Cliente, Sucursal y Fecha */}
      <VentaContextBar
        formData={formData}
        errors={headerErrors}
        clientes={clientes}
        sucursales={sucursales}
        sucursalMode={sucursalMode}
        sucursalFija={sucursalFija}
        showSucursal={isAdmin}
        clienteSearchTerm={clienteSearchTerm}
        onClienteSearchChange={setClienteSearchTerm}
        onClienteSelect={handleClienteSelect}
        onClienteCreated={appendCliente}
        isSearchingClientes={isSearchingClientes}
        isLoading={isLoadingCatalogs}
        onChange={handleHeaderChange}
      />

      {/* Hoja de Venta */}
      <VentaOrderLedger
        productos={productos}
        detalleInput={detalleInput}
        errors={detalleErrors}
        currentStock={currentProductStock}
        currentUnitPrice={currentUnitPrice}
        sucursalSelected={Boolean(formData.idSucursal)}
        idSucursal={formData.idSucursal ? Number(formData.idSucursal) : undefined}
        detalles={detalles}
        totalVenta={totalVenta}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        onGuardar={onFormSubmit}
        onProductoSearchChange={setProductoSearchTerm}
        isSearchingProductos={isSearchingProductos}
        onDetalleInputChange={handleDetalleInputChange}
        onAgregarDetalle={agregarDetalle}
        onQuitarDetalle={quitarDetalle}
        onCantidadChange={actualizarCantidadDetalle}
        onTipoPrecioChange={actualizarTipoPrecioDetalle}
      />

      {/* Barra fija inferior para dispositivos móviles */}
      <OrdenBarMovil
        totalVenta={totalVenta}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        onGuardar={onFormSubmit}
      />
    </div>
  )
}
