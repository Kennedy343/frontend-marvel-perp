import { memo } from 'react'

interface VentasPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (newPage: number) => void
  onLimitChange: (newLimit: number) => void
  disabled?: boolean
}

export const VentasPagination = memo(function VentasPagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  disabled = false,
}: VentasPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3.5 sm:flex-row">
      <div className="flex items-center gap-2 font-dm-sans text-xs text-gray-500">
        <span>Mostrando página {page} de {Math.max(1, totalPages)}</span>
        <span>•</span>
        <span>{totalItems} ventas registradas</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="ventas-limit-select" className="font-dm-sans text-xs text-gray-500">
            Filas:
          </label>
          <select
            id="ventas-limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={disabled}
            className="rounded border border-gray-200 bg-white px-2 py-1 font-dm-sans text-xs text-navy-950 focus:border-primary-blue focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1 || disabled}
            onClick={() => onPageChange(page - 1)}
            className="rounded border border-gray-200 bg-white px-2.5 py-1 font-dm-sans text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages || disabled}
            onClick={() => onPageChange(page + 1)}
            className="rounded border border-gray-200 bg-white px-2.5 py-1 font-dm-sans text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
})
