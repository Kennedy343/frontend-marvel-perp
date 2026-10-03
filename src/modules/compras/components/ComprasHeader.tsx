import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'

interface ComprasHeaderProps {
  total: number
  isLoading: boolean
}

export default function ComprasHeader({ total, isLoading }: ComprasHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">Compras</p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Ver Compras
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Consulta el historial de compras registradas en el sistema.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-2.5 shadow-soft">
          <span className="flex size-9 items-center justify-center rounded-lg bg-navy-950 text-white">
            <Icon name="icon-cart" className="size-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Total</p>
            <p className="font-sora text-xl font-semibold tabular-nums text-navy-950">
              {isLoading ? '—' : total.toLocaleString('es-GT')}
            </p>
          </div>
        </div>

        <Link
          to="/compras/crear"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950"
        >
          <Icon name="icon-plus" className="size-4" />
          Nueva Compra
        </Link>
      </div>
    </header>
  )
}
