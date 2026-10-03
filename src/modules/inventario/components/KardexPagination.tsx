interface KardexPaginationProps {
  page: number
  currentCount: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function KardexPagination({
  page,
  currentCount,
  totalItems,
  totalPages,
  onPageChange,
}: KardexPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {currentCount} de {totalItems.toLocaleString('es-GT')} existencias
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
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
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
