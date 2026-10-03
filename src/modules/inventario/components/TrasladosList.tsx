import { memo } from 'react'
import Icon from '../../../components/common/Icon'
import { ESTADO_TRASLADO_LABELS } from '../lib/etiquetas'
import type { EstadoTraslado, Traslado } from '../types/traslado'

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

const ESTADO_BADGE_CLASS: Record<EstadoTraslado, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700',
  ENVIADO: 'bg-blue-50 text-primary-blue',
  RECIBIDO: 'bg-emerald-50 text-emerald-700',
  ANULADO: 'bg-gray-100 text-gray-500',
}

function nombreUsuario(
  usuario: { nombreUsuario: string; apellidoUsuario: string } | null,
): string {
  if (!usuario) return '—'
  return `${usuario.nombreUsuario} ${usuario.apellidoUsuario}`.trim() || '—'
}

interface TrasladosListProps {
  traslados: Traslado[]
  isLoading: boolean
  onVerDetalle: (traslado: Traslado) => void
  onEnviar: (traslado: Traslado) => void
  onRecibir: (traslado: Traslado) => void
  onAnular: (traslado: Traslado) => void
}

export const TrasladosList = memo(function TrasladosList({
  traslados,
  isLoading,
  onVerDetalle,
  onEnviar,
  onRecibir,
  onAnular,
}: TrasladosListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-100 bg-white p-12 shadow-card">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          <span>Cargando traslados…</span>
        </div>
      </div>
    )
  }

  if (traslados.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-12 text-center shadow-card">
        <p className="font-sora text-base font-medium text-navy-950">
          No se encontraron traslados
        </p>
        <p className="mt-1 font-dm-sans text-xs text-gray-400">
          Ajuste los filtros o registre un nuevo traslado.
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
              <th scope="col" className="px-5 py-3.5">Traslado</th>
              <th scope="col" className="px-5 py-3.5">Trayecto</th>
              <th scope="col" className="px-5 py-3.5 text-center">Estado</th>
              <th scope="col" className="px-5 py-3.5">Motivo</th>
              <th scope="col" className="px-5 py-3.5">Creado</th>
              <th scope="col" className="px-5 py-3.5">Solicitante</th>
              <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {traslados.map((traslado) => (
              <tr
                key={traslado.idTraslado}
                className="transition-colors hover:bg-gray-50/50"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-navy-950">
                    Traslado #{traslado.idTraslado}
                  </p>
                  <p className="text-xs text-gray-400">
                    {traslado.detalles?.length ?? 0} producto
                    {(traslado.detalles?.length ?? 0) === 1 ? '' : 's'}
                  </p>
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-navy-950">
                      {traslado.sucursalOrigen?.nombreSucursal ||
                        `#${traslado.idSucursalOrigen}`}
                    </span>
                    <Icon name="icon-transfer" className="size-4 shrink-0 text-gray-400" />
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary-blue">
                      {traslado.sucursalDestino?.nombreSucursal ||
                        `#${traslado.idSucursalDestino}`}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ESTADO_BADGE_CLASS[traslado.estado] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {ESTADO_TRASLADO_LABELS[traslado.estado] ?? traslado.estado}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <p className="max-w-[200px] truncate text-xs text-gray-600">
                    {traslado.motivo || '—'}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-600">
                  {formatDate(traslado.fechaCreacion)}
                </td>

                <td className="px-5 py-3.5 text-xs text-gray-600">
                  {nombreUsuario(traslado.usuarioSolicita)}
                </td>

                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(traslado)}
                      title="Ver detalle"
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary-blue hover:text-primary-blue"
                    >
                      <Icon name="icon-search" className="size-4" />
                    </button>

                    {traslado.estado === 'PENDIENTE' && (
                      <button
                        type="button"
                        onClick={() => onEnviar(traslado)}
                        title="Enviar traslado"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-primary-blue transition-colors hover:bg-blue-100"
                      >
                        <Icon name="icon-transfer" className="size-4" />
                      </button>
                    )}

                    {traslado.estado === 'ENVIADO' && (
                      <button
                        type="button"
                        onClick={() => onRecibir(traslado)}
                        title="Recibir traslado"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <Icon name="icon-check" className="size-4" />
                      </button>
                    )}

                    {(traslado.estado === 'PENDIENTE' || traslado.estado === 'ENVIADO') && (
                      <button
                        type="button"
                        onClick={() => onAnular(traslado)}
                        title="Anular traslado"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-error-red transition-colors hover:bg-red-100"
                      >
                        <Icon name="icon-close" className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})
