import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import type { InventarioSucursal } from '../types/inventarioSucursal'

interface KardexTableProps {
  inventarios: InventarioSucursal[]
  loading: boolean
  error: string | null
}

// Hoist pure helper functions
const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (val: number): string => moneyFormatter.format(val)

export const KardexTable = memo(function KardexTable({
  inventarios,
  loading,
  error,
}: KardexTableProps) {
  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50/50 p-8 text-center">
        <p className="font-dm-sans text-sm font-semibold text-error-red">{error}</p>
      </section>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-dm-sans text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th scope="col" className="px-5 py-3.5">
                Producto / SKU
              </th>
              <th scope="col" className="px-5 py-3.5">
                Sucursal
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Stock Actual
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Stock Mínimo
              </th>
              <th scope="col" className="px-5 py-3.5 text-center">
                Estado
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Último Costo
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
                    <span>Cargando existencias de inventario…</span>
                  </div>
                </td>
              </tr>
            ) : inventarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                  <p className="font-sora text-base font-medium text-navy-950">
                    No se encontraron registros de inventario
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Ajusta los filtros seleccionados o registra existencias para tus sucursales.
                  </p>
                </td>
              </tr>
            ) : (
              inventarios.map((item) => {
                const stock = item.stockActual ?? 0
                const min = item.stockMinimo ?? 0
                const isCritical = stock <= min
                const isWarning = stock > min && stock <= min * 1.5
                const costo = Number(item.producto?.ultimoCosto ?? 0)
                const valorTotal = stock * (isNaN(costo) ? 0 : costo)

                return (
                  <tr
                    key={item.idInventario}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    {/* Producto / SKU */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-navy-950">
                          {item.producto?.nombreProducto ?? '—'}
                        </p>
                        <p className="font-mono text-xs text-gray-400">
                          {item.producto?.codigoProducto ?? `ID #${item.idProducto}`}
                        </p>
                      </div>
                    </td>

                    {/* Sucursal */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-navy-950">
                        {item.sucursal?.nombreSucursal ?? `Sucursal #${item.idSucursal}`}
                      </span>
                    </td>

                    {/* Stock Actual */}
                    <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums text-navy-950">
                      {stock.toLocaleString('es-GT')}
                    </td>

                    {/* Stock Mínimo */}
                    <td className="px-5 py-3.5 text-right font-mono text-xs tabular-nums text-gray-500">
                      {min.toLocaleString('es-GT')}
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3.5 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-error-red">
                          <Icon name="icon-production-quantity-limits" className="size-3.5 shrink-0" />
                          <span>Crítico</span>
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Alerta
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          Óptimo
                        </span>
                      )}
                    </td>

                    {/* Último Costo */}
                    <td className="px-5 py-3.5 text-right font-mono text-xs tabular-nums text-gray-600">
                      {formatCurrency(costo)}
                    </td>

                    {/* Valor Total */}
                    <td className="px-5 py-3.5 text-right font-mono font-medium tabular-nums text-navy-950">
                      {formatCurrency(valorTotal)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})
