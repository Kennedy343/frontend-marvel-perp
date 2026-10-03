import { useKardex } from '../hooks/useKardex'
import { KardexKPICards } from '../components/KardexKPICards'
import { KardexFilters } from '../components/KardexFilters'
import { KardexTable } from '../components/KardexTable'
import KardexPagination from '../components/KardexPagination'
import Icon from '../../../components/common/Icon'
import { Link } from 'react-router-dom'

export default function KardexPage() {
  const {
    filteredInventarios,
    sucursales,
    productoResultados,
    productoSeleccionado,
    setProductoSearchTerm,
    isSearchingProductos,
    loading,
    error,
    showSucursalFilter,
    fixedSucursalNombre,
    selectedSucursal,
    setSelectedSucursal,
    selectedProducto,
    setSelectedProducto,
    stockBajoOnly,
    setStockBajoOnly,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    totalItems,
    stats,
    refresh,
  } = useKardex()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sora text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
            Kardex / Existencias
          </h1>
          <p className="mt-1 font-dm-sans text-sm text-gray-500">
            Control integral de existencias físicas y valorizadas por sucursal en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/inventario/productos"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-dm-sans text-sm font-medium text-navy-950 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Icon name="icon-inventory" className="size-4 text-gray-500" />
            <span>Ver Productos</span>
          </Link>

          <Link
            to="/compras/crear"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-blue px-3.5 py-2 font-dm-sans text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Icon name="icon-cart" className="size-4" />
            <span>Ingreso por Compra</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KardexKPICards
        totalSkus={stats.totalSkus}
        totalUnits={stats.totalStockUnits}
        totalValorizado={stats.totalValorizado}
        criticalCount={stats.criticalStockCount}
      />

      {/* Filtros */}
      <KardexFilters
        sucursales={sucursales}
        productoResultados={productoResultados}
        productoSeleccionado={productoSeleccionado}
        onProductoSearchChange={setProductoSearchTerm}
        isSearchingProductos={isSearchingProductos}
        showSucursalFilter={showSucursalFilter}
        fixedSucursalNombre={fixedSucursalNombre}
        selectedSucursal={selectedSucursal}
        onSelectSucursal={setSelectedSucursal}
        selectedProducto={selectedProducto}
        onSelectProducto={setSelectedProducto}
        stockBajoOnly={stockBajoOnly}
        onToggleStockBajo={setStockBajoOnly}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Tabla de existencias */}
      <div className="space-y-0">
        <KardexTable
          inventarios={filteredInventarios}
          loading={loading}
          error={error}
        />
        {!error && !loading && (
          <KardexPagination
            page={page}
            currentCount={filteredInventarios.length}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
