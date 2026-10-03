import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import type { Venta } from '../types/venta'

interface VentasListProps {
  ventas: Venta[]
  isLoading: boolean
  onVerDetalle: (venta: Venta) => void
  onFacturar: (venta: Venta) => void
  onAnular: (venta: Venta) => void
}

const moneyFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const formatCurrency = (val: number | string): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return moneyFormatter.format(isNaN(num) ? 0 : num)
}

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

export const VentasList = memo(function VentasList({
  ventas,
  isLoading,
  onVerDetalle,
  onFacturar,
  onAnular,
}: VentasListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-12 shadow-card">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          <span>Cargando listado de ventas…</span>
        </div>
      </div>
    )
  }

  if (ventas.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-card">
        <p className="font-sora text-base font-medium text-navy-950">
          No se encontraron ventas
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          Intente con otros términos de búsqueda o registre una nueva venta.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] table-fixed text-left font-dm-sans text-sm xl:min-w-0">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[24%]" />
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th scope="col" className="px-3 py-3.5">
                Factura / Venta
              </th>
              <th scope="col" className="px-3 py-3.5">
                Cliente
              </th>
              <th scope="col" className="px-3 py-3.5">
                Sucursal
              </th>
              <th scope="col" className="whitespace-nowrap px-3 py-3.5">
                Fecha
              </th>
              <th scope="col" className="px-3 py-3.5 text-right">
                Total
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Estado
              </th>
              <th scope="col" className="px-3 py-3.5 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ventas.map((venta) => {
              const clientName = venta.cliente
                ? `${venta.cliente.primerNombre} ${venta.cliente.primerApellido}`
                : 'Consumidor Final'
              const facturaLabel =
                venta.serieFactura && venta.numeroFactura
                  ? `${venta.serieFactura}-${venta.numeroFactura}`
                  : `Venta #${venta.idVenta}`
              const sucursalLabel =
                venta.sucursal?.nombreSucursal || `Sucursal #${venta.idSucursal}`

              return (
                <tr
                  key={venta.idVenta}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  {/* Factura / Venta */}
                  <td className="px-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-950" title={facturaLabel}>
                        {facturaLabel}
                      </p>
                      <p
                        className="truncate font-mono text-xs text-gray-400"
                        title={`ID: ${venta.idVenta}`}
                      >
                        ID: {venta.idVenta}
                      </p>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="px-3 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-950" title={clientName}>
                        {clientName}
                      </p>
                      {venta.cliente?.nit ? (
                        <p
                          className="truncate font-mono text-xs text-gray-400"
                          title={`NIT: ${venta.cliente.nit}`}
                        >
                          NIT: {venta.cliente.nit}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Sin NIT</p>
                      )}
                    </div>
                  </td>

                  {/* Sucursal */}
                  <td className="px-3 py-3.5">
                    <span
                      className="inline-block max-w-full truncate rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-navy-950"
                      title={sucursalLabel}
                    >
                      {sucursalLabel}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="whitespace-nowrap px-3 py-3.5 text-xs tabular-nums text-gray-600">
                    {formatDate(venta.fechaVenta)}
                  </td>

                  {/* Total */}
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-sora font-semibold tabular-nums text-navy-950">
                    {formatCurrency(venta.totalVenta)}
                  </td>

                  {/* Estado */}
                  <td className="whitespace-nowrap px-3 py-3.5 text-center">
                    {!venta.ventaActiva ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-error-red">
                        Anulada
                      </span>
                    ) : venta.facturada ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Facturada
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Sin facturar
                      </span>
                    )}
                  </td>

                  {/* Acciones permanentes */}
                  <td className="whitespace-nowrap px-3 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onVerDetalle(venta)}
                        title="Ver detalle"
                        className="inline-flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary-blue hover:text-primary-blue"
                      >
                        <Icon name="icon-search" className="size-4" />
                      </button>

                      {venta.ventaActiva && !venta.facturada && (
                        <button
                          type="button"
                          onClick={() => onFacturar(venta)}
                          title="Facturar venta"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <Icon name="icon-check" className="size-4" />
                        </button>
                      )}

                      {venta.ventaActiva && (
                        <button
                          type="button"
                          onClick={() => onAnular(venta)}
                          title="Anular venta"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-error-red transition-colors hover:bg-red-100"
                        >
                          <Icon name="icon-close" className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})
