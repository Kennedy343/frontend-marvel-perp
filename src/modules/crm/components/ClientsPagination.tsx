import type { ClientsMeta } from '../types/client'

interface ClientsPaginationProps {
  page: number
  currentCount: number
  meta: ClientsMeta
  onChangePage: (page: number) => void
}

function ClientsPagination({ page, currentCount, meta, onChangePage }: ClientsPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {currentCount} de {meta.total.toLocaleString('es-GT')} clientes
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChangePage(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="rounded-lg bg-navy-950 px-3 py-1.5 font-semibold tabular-nums text-white">
          {page}
        </span>
        <button
          type="button"
          onClick={() => onChangePage(page + 1)}
          disabled={page >= meta.totalPages}
          className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default ClientsPagination
