import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'

interface ProveedoresEmptyStateProps {
  hasSearch: boolean
}

export default function ProveedoresEmptyState({ hasSearch }: ProveedoresEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon name="icon-truck" className="size-6" />
      </span>
      <div>
        <p className="font-sora text-base font-semibold text-navy-950">
          {hasSearch ? 'Sin resultados' : 'Aún no hay proveedores'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {hasSearch
            ? 'Prueba con otro nombre, NIT o teléfono.'
            : 'Registra tu primer proveedor para comenzar.'}
        </p>
      </div>
      {!hasSearch ? (
        <Link
          to="/proveedores/crear"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-plus" className="size-4" />
          Nuevo Proveedor
        </Link>
      ) : null}
    </div>
  )
}
