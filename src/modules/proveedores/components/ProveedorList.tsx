import type { ReactNode } from 'react'
import Icon from '../../../components/common/Icon'
import { getInitials, getProveedorAccent } from '../lib/proveedorIdentity'
import type { Proveedor, ProveedorToDelete } from '../types/proveedor'
import ProveedoresEmptyState from './ProveedoresEmptyState'

interface ProveedorListProps {
  proveedores: Proveedor[]
  isLoading: boolean
  hasSearch?: boolean
  onEdit: (idProveedor: number) => void
  onDelete: (proveedor: ProveedorToDelete) => void
  footer?: ReactNode
}

const COLUMNS = ['Proveedor', 'NIT', 'Teléfono', 'Departamento', 'Acciones']

export default function ProveedorList({
  proveedores,
  isLoading,
  hasSearch = false,
  onEdit,
  onDelete,
  footer,
}: ProveedorListProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3.5 sm:px-6">Proveedor</th>
              <th className="px-4 py-3.5 sm:px-6">NIT</th>
              <th className="hidden px-4 py-3.5 sm:table-cell sm:px-6">Teléfono</th>
              <th className="hidden px-4 py-3.5 md:table-cell sm:px-6">Departamento</th>
              <th className="px-4 py-3.5 text-right sm:px-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  Cargando proveedores…
                </td>
              </tr>
            ) : proveedores.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="sm:px-6">
                  <ProveedoresEmptyState hasSearch={hasSearch} />
                </td>
              </tr>
            ) : (
              proveedores.map((proveedor) => {
                const avatarAccent = getProveedorAccent(proveedor.idProveedor)
                return (
                  <tr
                    key={proveedor.idProveedor}
                    className="text-gray-600 transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full font-sora text-xs font-semibold ${avatarAccent}`}
                        >
                          {getInitials(proveedor.nombreProveedor)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy-950">
                            {proveedor.nombreProveedor}
                          </p>
                          <p className="truncate text-xs text-gray-400 sm:hidden">
                            {proveedor.departamento?.nombreDepartamento || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums text-gray-900 sm:px-6">
                      {proveedor.nitProveedor}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 tabular-nums sm:table-cell sm:px-6">
                      {proveedor.telefonoProveedor || '—'}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 text-gray-600 md:table-cell sm:px-6">
                      {proveedor.departamento?.nombreDepartamento || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(proveedor.idProveedor)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
                        >
                          <Icon name="icon-edit" className="size-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDelete({
                              id: proveedor.idProveedor,
                              nombre: proveedor.nombreProveedor,
                            })
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-error-red transition-colors hover:border-error-red/40 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red"
                          aria-label={`Eliminar proveedor ${proveedor.nombreProveedor}`}
                        >
                          <Icon name="icon-trash" className="size-3.5" />
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
