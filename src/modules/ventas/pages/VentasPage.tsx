import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import { useVentas } from '../hooks/useVentas'
import { ventaService } from '../services/ventaService'
import { inventarioSucursalService } from '../../inventario/services/inventarioSucursalService'
import { useSucursalScope } from '../../../hooks/useSucursalScope'
import { VentasFilters } from '../components/VentasFilters'
import { VentasList } from '../components/VentasList'
import { VentasPagination } from '../components/VentasPagination'
import { DetalleVentaModal } from '../components/DetalleVentaModal'
import { FacturarVentaModal } from '../components/FacturarVentaModal'
import { AnularVentaModal } from '../components/AnularVentaModal'
import type { Venta, FacturarVentaDto, AnularVentaDto } from '../types/venta'
import type { SucursalInventario } from '../../inventario/types/inventarioSucursal'

export default function VentasPage() {
  const { sucursalesPropias, mode: sucursalMode, sucursalFija } = useSucursalScope()

  const [search, setSearch] = useState('')
  const [selectedSucursal, setSelectedSucursal] = useState<number | undefined>(() => {
    if (sucursalMode === 'auto') return sucursalFija?.idSucursal
    if (sucursalMode === 'select-propio') return sucursalesPropias[0]?.idSucursal
    return undefined
  })
  const [facturadaFilter, setFacturadaFilter] = useState<boolean | undefined>(undefined)
  const [activaFilter, setActivaFilter] = useState<boolean | undefined>(undefined)
  const [sucursales, setSucursales] = useState<SucursalInventario[]>([])
  const sucursalesList = sucursalMode === 'select-todas' ? sucursales : sucursalesPropias

  // Modal de Detalle
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false)

  // Modal Facturar
  const [facturarModalOpen, setFacturarModalOpen] = useState(false)
  const [ventaAFacturar, setVentaAFacturar] = useState<Venta | null>(null)
  const [isFacturando, setIsFacturando] = useState(false)
  const [facturarError, setFacturarError] = useState<string | null>(null)

  // Modal Anular
  const [anularModalOpen, setAnularModalOpen] = useState(false)
  const [ventaAnular, setVentaAnular] = useState<Venta | null>(null)
  const [isAnulando, setIsAnulando] = useState(false)
  const [anularError, setAnularError] = useState<string | null>(null)

  // Toast / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const {
    ventas,
    meta,
    page,
    limit,
    isLoading,
    error,
    updateFilters,
    changePage,
    changeLimit,
    refetch,
  } = useVentas(
    {
      search: search || undefined,
      idSucursal: selectedSucursal,
      facturada: facturadaFilter,
      ventaActiva: activaFilter,
    },
    sucursalMode === 'auto' ? sucursalFija?.idSucursal : undefined,
  )

  // Carga de sucursales para el filtro (solo el admin sin sucursal asignada)
  useEffect(() => {
    if (sucursalMode !== 'select-todas') return

    const controller = new AbortController()
    inventarioSucursalService
      .getSucursales(controller.signal)
      .then((res) => setSucursales(res || []))
      .catch((err) => console.error('Error al cargar sucursales:', err))

    return () => controller.abort()
  }, [sucursalMode])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    updateFilters({ search: val || undefined })
  }

  const handleSucursalChange = (val: number | undefined) => {
    if (sucursalMode === 'auto') return
    setSelectedSucursal(val)
    updateFilters({ idSucursal: val })
  }

  const handleFacturadaChange = (val: boolean | undefined) => {
    setFacturadaFilter(val)
    updateFilters({ facturada: val })
  }

  const handleActivaChange = (val: boolean | undefined) => {
    setActivaFilter(val)
    updateFilters({ ventaActiva: val })
  }

  const handleResetFilters = () => {
    setSearch('')
    const resetSucursal =
      sucursalMode === 'auto'
        ? sucursalFija?.idSucursal
        : sucursalMode === 'select-propio'
          ? sucursalesPropias[0]?.idSucursal
          : undefined
    setSelectedSucursal(resetSucursal)
    setFacturadaFilter(undefined)
    setActivaFilter(undefined)
    updateFilters({
      search: undefined,
      idSucursal: resetSucursal,
      facturada: undefined,
      ventaActiva: undefined,
    })
  }

  // Abrir detalle completo
  const handleVerDetalle = async (venta: Venta) => {
    setSelectedVenta(null)
    setDetalleModalOpen(true)
    setIsLoadingDetalle(true)
    try {
      const fullVenta = await ventaService.getById(venta.idVenta)
      setSelectedVenta(fullVenta)
    } catch (err) {
      console.error('Error al cargar detalle de venta:', err)
      setFeedback({
        type: 'error',
        message: 'No se pudo cargar el detalle completo de la venta.',
      })
      setDetalleModalOpen(false)
    } finally {
      setIsLoadingDetalle(false)
    }
  }

  // Abrir Facturar
  const handleOpenFacturar = (venta: Venta) => {
    setVentaAFacturar(venta)
    setFacturarError(null)
    setFacturarModalOpen(true)
  }

  const handleConfirmFacturar = async (payload: FacturarVentaDto) => {
    if (!ventaAFacturar) return
    setIsFacturando(true)
    setFacturarError(null)
    try {
      await ventaService.facturar(ventaAFacturar.idVenta, payload)
      setFeedback({
        type: 'success',
        message: `Venta #${ventaAFacturar.idVenta} facturada exitosamente (${payload.serieFactura}-${payload.numeroFactura}).`,
      })
      setFacturarModalOpen(false)
      setVentaAFacturar(null)
      refetch()
    } catch (err: unknown) {
      console.error('Error al facturar venta:', err)
      setFacturarError('No se pudo completar la facturación. Verifique los datos e intente nuevamente.')
    } finally {
      setIsFacturando(false)
    }
  }

  // Abrir Anular
  const handleOpenAnular = (venta: Venta) => {
    setVentaAnular(venta)
    setAnularError(null)
    setAnularModalOpen(true)
  }

  const handleConfirmAnular = async (payload: AnularVentaDto) => {
    if (!ventaAnular) return
    setIsAnulando(true)
    setAnularError(null)
    try {
      await ventaService.anular(ventaAnular.idVenta, payload)
      setFeedback({
        type: 'success',
        message: `Venta #${ventaAnular.idVenta} anulada correctamente y existencias devueltas a inventario.`,
      })
      setAnularModalOpen(false)
      setVentaAnular(null)
      refetch()
    } catch (err: unknown) {
      console.error('Error al anular venta:', err)
      setAnularError('No se pudo anular la venta. Intente nuevamente.')
    } finally {
      setIsAnulando(false)
    }
  }

  return (
    <div className="space-y-6 motion-safe:animate-rise">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sora text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
            Ventas
          </h1>
          <p className="mt-1 font-dm-sans text-sm text-gray-500">
            Administración de ventas, emisión de facturas y control de despachos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ventas/crear"
            className="inline-flex items-center gap-2 justify-center rounded-lg bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950"
          >
            <Icon name="icon-plus" className="size-4" />
            <span>Nueva Venta</span>
          </Link>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-error-red'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-white ${
                feedback.type === 'success' ? 'bg-emerald-600' : 'bg-error-red'
              }`}
            >
              <Icon
                name={feedback.type === 'success' ? 'icon-check' : 'icon-close'}
                className="size-3.5"
              />
            </span>
            <p>{feedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Filtros */}
      <VentasFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedSucursal={selectedSucursal}
        onSucursalChange={handleSucursalChange}
        facturadaFilter={facturadaFilter}
        onFacturadaChange={handleFacturadaChange}
        activaFilter={activaFilter}
        onActivaChange={handleActivaChange}
        sucursales={sucursalesList}
        showSucursalFilter={sucursalMode !== 'auto'}
        fixedSucursalNombre={sucursalFija?.nombreSucursal}
        allowAllSucursales={sucursalMode === 'select-todas'}
        onReset={handleResetFilters}
      />

      {/* Error de carga */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-error-red">
          {error}
        </div>
      )}

      {/* Tabla */}
      <VentasList
        ventas={ventas}
        isLoading={isLoading}
        onVerDetalle={handleVerDetalle}
        onFacturar={handleOpenFacturar}
        onAnular={handleOpenAnular}
      />

      {/* Paginación */}
      <div className="rounded-lg border border-gray-100 bg-white shadow-card">
        <VentasPagination
          page={page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          limit={limit}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          disabled={isLoading}
        />
      </div>

      {/* Modales */}
      <DetalleVentaModal
        isOpen={detalleModalOpen}
        isLoading={isLoadingDetalle}
        venta={selectedVenta}
        onClose={() => setDetalleModalOpen(false)}
        onOpenFacturar={handleOpenFacturar}
        onOpenAnular={handleOpenAnular}
      />

      <FacturarVentaModal
        isOpen={facturarModalOpen}
        isSubmitting={isFacturando}
        venta={ventaAFacturar}
        error={facturarError}
        onClose={() => setFacturarModalOpen(false)}
        onConfirm={handleConfirmFacturar}
      />

      <AnularVentaModal
        key={anularModalOpen ? 'open' : 'closed'}
        isOpen={anularModalOpen}
        isSubmitting={isAnulando}
        venta={ventaAnular}
        error={anularError}
        onClose={() => setAnularModalOpen(false)}
        onConfirm={handleConfirmAnular}
      />
    </div>
  )
}
