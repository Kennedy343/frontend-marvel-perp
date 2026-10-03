import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import { ORIGEN_MOVIMIENTO_LABELS } from '../lib/etiquetas'
import type { MovimientoInventario } from '../types/movimiento'

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
})

function FechaHoraCell({ value }: { value: string }) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return <span className="text-xs text-gray-500">—</span>
  }
  return (
    <>
      <p className="font-medium tabular-nums text-navy-950">
        {dateFormatter.format(date)}
      </p>
      <p className="mt-0.5 text-xs leading-none tabular-nums text-gray-500">
        {timeFormatter.format(date)}
      </p>
    </>
  )
}

function formatUsuario(nombre: string, apellido: string): string {
  const full = `${nombre ?? ''} ${apellido ?? ''}`.trim()
  return full || '—'
}

interface MovimientosListProps {
  movimientos: MovimientoInventario[]
  isLoading: boolean
  onVerKardex: (movimiento: MovimientoInventario) => void
}

export const MovimientosList = memo(function MovimientosList({
  movimientos,
  isLoading,
  onVerKardex,
}: MovimientosListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-12 shadow-card">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          <span>Cargando movimientos…</span>
        </div>
      </div>
    )
  }

  if (movimientos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-card">
        <p className="font-sora text-base font-medium text-navy-950">
          No se encontraron movimientos
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-500">
          Ajuste los filtros para ver entradas y salidas de inventario.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left font-dm-sans text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th scope="col" className="px-5 py-3.5">Fecha</th>
              <th scope="col" className="px-5 py-3.5">Producto</th>
              <th scope="col" className="px-5 py-3.5">Sucursal</th>
              <th scope="col" className="px-5 py-3.5 text-center">Tipo</th>
              <th scope="col" className="px-5 py-3.5">Origen</th>
              <th scope="col" className="px-5 py-3.5 text-right">Cantidad</th>
              <th scope="col" className="px-5 py-3.5 text-right">Saldo</th>
              <th scope="col" className="px-5 py-3.5">Usuario</th>
              <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movimientos.map((mov) => {
              const esEntrada = mov.tipo === 'ENTRADA'
              const usuario = formatUsuario(
                mov.usuario?.nombreUsuario,
                mov.usuario?.apellidoUsuario,
              )
              return (
                <tr
                  key={mov.idMovimiento}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <FechaHoraCell value={mov.fecha} />
                  </td>

                  <td className="px-5 py-3.5">
                    <p
                      className="max-w-[220px] truncate font-medium text-navy-950"
                      title={mov.producto?.nombreProducto || `Producto #${mov.idProducto}`}
                    >
                      {mov.producto?.nombreProducto || `Producto #${mov.idProducto}`}
                    </p>
                    <p className="font-mono text-xs tabular-nums text-gray-500">
                      {mov.producto?.codigoProducto || '—'}
                    </p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-navy-950">
                      {mov.sucursal?.nombreSucursal || `Sucursal #${mov.idSucursal}`}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        esEntrada
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-error-red'
                      }`}
                    >
                      <Icon
                        name={esEntrada ? 'icon-arrow-down-circle' : 'icon-arrow-up-circle'}
                        className="size-3.5"
                      />
                      {esEntrada ? 'Entrada' : 'Salida'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {ORIGEN_MOVIMIENTO_LABELS[mov.origen] ?? mov.origen}
                    </span>
                    {mov.observacion && (
                      <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500">
                        {mov.observacion}
                      </p>
                    )}
                  </td>

                  <td
                    className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                      esEntrada ? 'text-emerald-700' : 'text-error-red'
                    }`}
                  >
                    {esEntrada ? '+' : '−'}
                    {mov.cantidad}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs">
                    <span className="tabular-nums text-gray-500">
                      {mov.saldoAnterior}
                    </span>
                    <span className="mx-1.5 text-gray-300">→</span>
                    <span className="font-semibold tabular-nums text-navy-950">
                      {mov.saldoNuevo}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <span className="block max-w-[160px] truncate" title={usuario}>
                      {usuario}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onVerKardex(mov)}
                      title="Ver kardex del producto"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary-blue hover:text-primary-blue"
                    >
                      <Icon name="icon-inventory" className="size-4" />
                      <span>Kardex</span>
                    </button>
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
