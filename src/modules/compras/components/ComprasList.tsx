import Icon from '../../../components/common/Icon'
import { formatFecha, formatHora } from '../utils/fecha'
import type { Compra } from '../types/compra'

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

function formatTotal(value: number) {
  return moneyFormatter.format(value)
}

interface ComprasListProps {
  compras: Compra[]
  isLoading: boolean
  onVer: (compra: Compra) => void
  onAnular: (compra: Compra) => void
}

export default function ComprasList({
  compras,
  isLoading,
  onVer,
  onAnular,
}: ComprasListProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3.5 sm:px-6">Compra</th>
              <th className="px-4 py-3.5 sm:px-6">Proveedor</th>
              <th className="hidden px-4 py-3.5 sm:table-cell sm:px-6">Sucursal</th>
              <th className="hidden px-4 py-3.5 md:table-cell sm:px-6">Fecha</th>
              <th className="px-4 py-3.5 text-right sm:px-6">Total</th>
              <th className="px-4 py-3.5 sm:px-6">Estado</th>
              <th className="px-4 py-3.5 text-right sm:px-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  Cargando compras…
                </td>
              </tr>
            ) : compras.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  No se encontraron compras para mostrar.
                </td>
              </tr>
            ) : (
              compras.map((compra) => (
                <tr
                  key={compra.idCompra}
                  className="text-gray-600 transition-colors hover:bg-gray-50/80"
                >
                  <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    <p className="font-semibold tabular-nums text-navy-950">
                      {compra.serieFactura} - {compra.numeroFactura}
                    </p>
                    <p className="text-xs text-gray-400">#{compra.idCompra}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium text-gray-900 sm:px-6">
                    {compra.proveedor?.nombreProveedor || '—'}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell sm:px-6">
                    {compra.sucursal?.nombreSucursal || '—'}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3.5 md:table-cell sm:px-6">
                    <span className="block tabular-nums">{formatFecha(compra.fechaCompra)}</span>
                    <span className="block text-xs text-gray-500 tabular-nums">
                      {formatHora(compra.fechaCompra)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold tabular-nums text-navy-950 sm:px-6">
                    {formatTotal(compra.totalCompra)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                    {compra.compraActiva ? (
                      <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        Anulada
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right sm:px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onVer(compra)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
                      >
                        <Icon name="icon-eye" className="size-3.5" />
                        Ver
                      </button>
                      {compra.compraActiva && (
                        <button
                          type="button"
                          onClick={() => onAnular(compra)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-error-red transition-colors hover:border-error-red/40 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red"
                        >
                          <Icon name="icon-trash" className="size-3.5" />
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}