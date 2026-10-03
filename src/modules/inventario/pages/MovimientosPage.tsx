import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import { useMovimientos } from '../hooks/useMovimientos'
import { movimientoService } from '../services/movimientoService'
import { MovimientosFilters } from '../components/MovimientosFilters'
import { MovimientosList } from '../components/MovimientosList'
import MovimientosPagination from '../components/MovimientosPagination'
import KardexProductoModal from '../components/KardexProductoModal'
import type { MovimientoInventario } from '../types/movimiento'

export default function MovimientosPage() {
  const {
    movimientos,
    meta,
    isLoading,
    error,
    productoResultados,
    productoSeleccionado,
    setProductoSearchTerm,
    isSearchingProductos,
    sucursales,
    showSucursalFilter,
    fixedSucursalNombre,
    selectedProducto,
    setSelectedProducto,
    selectedSucursal,
    setSelectedSucursal,
    tipo,
    setTipo,
    origen,
    setOrigen,
    desde,
    setDesde,
    hasta,
    setHasta,
    page,
    changePage,
    resetFilters,
    refresh,
  } = useMovimientos()

  const [kardexTarget, setKardexTarget] = useState<MovimientoInventario | null>(null)
  const [kardexMovimientos, setKardexMovimientos] = useState<MovimientoInventario[]>([])
  const [kardexLoading, setKardexLoading] = useState(false)
  const [kardexError, setKardexError] = useState<string | null>(null)
  const kardexRequestRef = useRef(0)

  const handleVerKardex = async (movimiento: MovimientoInventario) => {
    const requestId = kardexRequestRef.current + 1
    kardexRequestRef.current = requestId

    setKardexTarget(movimiento)
    setKardexMovimientos([])
    setKardexError(null)
    setKardexLoading(true)

    try {
      const rows = await movimientoService.getKardex(movimiento.idProducto)
      if (requestId !== kardexRequestRef.current) return
      setKardexMovimientos(rows ?? [])
    } catch (err) {
      if (requestId !== kardexRequestRef.current) return
      console.error('Error al cargar kardex del producto:', err)
      setKardexError('No se pudo cargar el kardex del producto.')
    } finally {
      if (requestId === kardexRequestRef.current) setKardexLoading(false)
    }
  }

  const closeKardex = () => {
    kardexRequestRef.current += 1
    setKardexTarget(null)
    setKardexMovimientos([])
    setKardexError(null)
    setKardexLoading(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">
            Inventario
          </p>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            Movimientos de Inventario
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Kardex de entradas y salidas registradas por compras, ventas, ajustes y
            traslados.
          </p>
        </div>
        <Link
          to="/inventario/traslados"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-950 shadow-soft transition-colors hover:bg-gray-50"
        >
          <Icon name="icon-transfer" className="size-4 text-gray-500" />
          <span>Ver Traslados</span>
        </Link>
      </div>

      <MovimientosFilters
        productoResultados={productoResultados}
        productoSeleccionado={productoSeleccionado}
        onProductoSearchChange={setProductoSearchTerm}
        isSearchingProductos={isSearchingProductos}
        sucursales={sucursales}
        showSucursalFilter={showSucursalFilter}
        fixedSucursalNombre={fixedSucursalNombre}
        selectedProducto={selectedProducto}
        onSelectProducto={setSelectedProducto}
        selectedSucursal={selectedSucursal}
        onSelectSucursal={setSelectedSucursal}
        tipo={tipo}
        onSelectTipo={setTipo}
        origen={origen}
        onSelectOrigen={setOrigen}
        desde={desde}
        onDesdeChange={setDesde}
        hasta={hasta}
        onHastaChange={setHasta}
        onReset={resetFilters}
        onRefresh={refresh}
        loading={isLoading}
      />

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-8 text-center text-sm font-medium text-error-red"
        >
          {error}
        </p>
      ) : (
        <div className="space-y-0">
          <MovimientosList
            movimientos={movimientos}
            isLoading={isLoading}
            onVerKardex={handleVerKardex}
          />
          {!isLoading && (
            <MovimientosPagination
              page={page}
              currentCount={movimientos.length}
              meta={meta}
              onChangePage={changePage}
            />
          )}
        </div>
      )}

      <KardexProductoModal
        open={kardexTarget !== null}
        productoNombre={kardexTarget?.producto?.nombreProducto}
        productoCodigo={kardexTarget?.producto?.codigoProducto}
        movimientos={kardexMovimientos}
        isLoading={kardexLoading}
        error={kardexError}
        onClose={closeKardex}
      />
    </div>
  )
}
