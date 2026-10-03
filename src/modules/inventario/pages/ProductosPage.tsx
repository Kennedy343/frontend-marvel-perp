import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal'
import { productoService } from '../services/productoService'
import { useProductos } from '../hooks/useProductos'

const costFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function formatCosto(value: number) {
  return costFormatter.format(value)
}

function ProductosPage() {
  const [search, setSearch] = useState('')
  const [productoAEliminar, setProductoAEliminar] = useState<{ id: number; nombre: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { productos, meta, isLoading, error, page, changePage, refetch } = useProductos(search)

  const handleEliminar = async () => {
    if (!productoAEliminar) return
    try {
      setIsDeleting(true)
      await productoService.remove(productoAEliminar.id)
      setFeedbackMessage({ type: 'success', text: `Producto "${productoAEliminar.nombre}" eliminado exitosamente.` })
      setProductoAEliminar(null)
      refetch()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      setFeedbackMessage({ type: 'error', text: 'No se pudo eliminar el producto. Intente nuevamente.' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">Inventario</p>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            Ver Productos
          </h1>
          <p className="mt-2 text-sm text-gray-500">Consulta el catálogo de productos y sus categorías.</p>
        </div>
        <Link
          to="/inventario/productos/crear"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-plus" className="size-4" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {feedbackMessage && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
              : 'border-red-200 bg-red-50/90 text-error-red'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-white ${
                feedbackMessage.type === 'success' ? 'bg-emerald-600' : 'bg-error-red'
              }`}
            >
              <Icon name={feedbackMessage.type === 'success' ? 'icon-check' : 'icon-close'} className="size-3.5" />
            </span>
            <p>{feedbackMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      <article className="flex w-full max-w-xs items-center justify-between rounded-xl border border-gray-200/80 bg-white p-6 shadow-soft motion-safe:animate-rise">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Total Productos</p>
          <p className="mt-2 font-sora text-4xl font-semibold tabular-nums tracking-tight text-navy-950">
            {isLoading ? '—' : meta.total.toLocaleString('es-GT')}
          </p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-lg bg-navy-950 text-white">
          <Icon name="icon-inventory" className="size-6" />
        </span>
      </article>

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft">
        <div className="border-b border-gray-200 p-4">
          <label className="flex h-10 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-gray-400 transition-colors focus-within:border-primary-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-blue/15">
            <Icon name="icon-search" className="size-5 shrink-0" />
            <span className="sr-only">Buscar productos</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto…"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        {error ? (
          <p role="alert" className="p-8 text-center text-sm font-medium text-error-red">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Nombre</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5">Último Costo</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Cargando productos…</td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay productos para mostrar.</td>
                  </tr>
                ) : (
                  productos.map((producto) => (
                    <tr key={producto.idProducto} className="text-gray-600 transition-colors hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-6 py-4 font-semibold tabular-nums text-navy-950">
                        {producto.codigoProducto}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-navy-950">{producto.nombreProducto}</td>
                      <td className="max-w-70 truncate px-6 py-4">{producto.descripcion || '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 tabular-nums">
                        {producto.ultimoCosto > 0 ? (
                          <span className="font-semibold text-navy-950">{formatCosto(producto.ultimoCosto)}</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/80">
                            Sin costo inicial
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/inventario/productos/${producto.idProducto}/editar`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
                          >
                            <Icon name="icon-edit" className="size-3.5" />
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setProductoAEliminar({ id: producto.idProducto, nombre: producto.nombreProducto })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-error-red transition-colors hover:border-error-red/40 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red"
                          >
                            <Icon name="icon-trash" className="size-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mostrando {productos.length} de {meta.total.toLocaleString('es-GT')} productos
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="rounded-lg bg-navy-950 px-3 py-1.5 font-semibold tabular-nums text-white">{page}</span>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page >= meta.totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <DeleteConfirmationModal
        open={Boolean(productoAEliminar)}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar el producto "${productoAEliminar?.nombre}"?`}
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onCancel={() => setProductoAEliminar(null)}
      />
    </div>
  )
}

export default ProductosPage