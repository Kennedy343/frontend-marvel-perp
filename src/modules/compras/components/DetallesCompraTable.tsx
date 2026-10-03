import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import DetalleCompraRow from './DetalleCompraRow'
import type { DetalleCompraFormData, DetalleCompraPatch } from '../types/compra'

interface DetallesCompraTableProps {
  detalles: DetalleCompraFormData[]
  disabled: boolean
  onQuitar: (idDetalleTemporal: number) => void
  onUpdateDetalle: (idDetalleTemporal: number, patch: DetalleCompraPatch) => void
}

const DetallesCompraTable = memo(function DetallesCompraTable({
  detalles,
  disabled,
  onQuitar,
  onUpdateDetalle,
}: DetallesCompraTableProps) {
  const isEmpty = detalles.length === 0

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            <Icon name="icon-inventory" className="size-4.5" />
          </span>
          <div>
            <h2 className="font-sora text-base font-semibold text-navy-950">
              Productos agregados
            </h2>
            <p className="font-dm-sans text-sm text-gray-500">
              {isEmpty
                ? 'Aún no hay productos en la compra.'
                : `${detalles.length} ${detalles.length === 1 ? 'línea' : 'líneas'} en la factura`}
            </p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="px-5 py-14 text-center">
          <Icon name="icon-cart" className="mx-auto mb-2 size-8 text-gray-300" />
          <p className="font-dm-sans text-sm font-medium text-navy-950">
            No hay productos en la compra
          </p>
          <p className="mt-0.5 font-dm-sans text-xs text-gray-400">
            Use el buscador de arriba para agregar la primera línea.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left font-dm-sans text-sm max-md:block max-md:min-w-0">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500 max-md:hidden">
              <tr>
                <th scope="col" className="px-4 py-3.5">
                  Producto / SKU
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Cantidad
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Costo unit.
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Precios de venta
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Subtotal
                </th>
                <th scope="col" className="px-4 py-3.5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 max-md:block max-md:divide-y-0 max-md:p-4">
              {detalles.map((detalle) => (
                <DetalleCompraRow
                  key={detalle.idDetalleTemporal}
                  detalle={detalle}
                  disabled={disabled}
                  onQuitar={onQuitar}
                  onUpdateDetalle={onUpdateDetalle}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
})

export default DetallesCompraTable
