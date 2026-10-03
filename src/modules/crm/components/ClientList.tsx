import type { ReactNode } from 'react'
import Icon from '../../../components/common/Icon'
import ClientAvatar from './ClientAvatar'
import ClientsEmptyState from './ClientsEmptyState'
import { getFullName } from '../lib/clientIdentity'
import type { Client } from '../types/client'

interface ClientListProps {
  clients: Client[]
  isLoading: boolean
  hasSearch: boolean
  onEdit: (idCliente: number) => void
  onDelete: (client: Client) => void
  footer?: ReactNode
}

const COLUMNS = ['Cliente', 'DPI / NIT', 'Teléfono', 'Categoría', 'Sucursal', 'Acciones']

function ClientList({ clients, isLoading, hasSearch, onEdit, onDelete, footer }: ClientListProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3.5 sm:px-6">Cliente</th>
              <th className="px-4 py-3.5 sm:px-6">DPI / NIT</th>
              <th className="hidden px-4 py-3.5 sm:table-cell sm:px-6 md:table-cell">Teléfono</th>
              <th className="hidden px-4 py-3.5 sm:table-cell sm:px-6">Categoría</th>
              <th className="hidden px-4 py-3.5 sm:px-6 lg:table-cell">Sucursal</th>
              <th className="px-4 py-3.5 text-right sm:px-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  Cargando clientes…
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="sm:px-6">
                  <ClientsEmptyState hasSearch={hasSearch} />
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const fullName = getFullName(client.primerNombre, client.primerApellido)
                return (
                  <tr key={client.idCliente} className="text-gray-600 transition-colors hover:bg-gray-50/80">
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <ClientAvatar
                          idCliente={client.idCliente}
                          primerNombre={client.primerNombre}
                          primerApellido={client.primerApellido}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-950">{fullName}</p>
                          <p className="truncate text-xs text-gray-400 sm:hidden">
                            {client.categoria?.nombreCategoria || client.sucursal?.nombreSucursal || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums sm:px-6">
                      <p className="font-medium text-gray-900">{client.dpiCliente}</p>
                      {client.nit && client.nit !== 'C/F' ? (
                        <p className="text-xs text-gray-400">NIT: {client.nit}</p>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3.5 tabular-nums sm:table-cell sm:px-6">
                      {client.telefono || '—'}
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell sm:px-6">
                      {client.categoria?.nombreCategoria ? (
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {client.categoria.nombreCategoria}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 sm:px-6 lg:table-cell">
                      {client.sucursal?.nombreSucursal || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(client.idCliente)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
                        >
                          <Icon name="icon-edit" className="size-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(client)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-error-red transition-colors hover:border-error-red/40 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red"
                          aria-label={`Eliminar cliente ${fullName}`}
                        >
                          <Icon name="icon-trash" className="size-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </section>
  )
}

export default ClientList
