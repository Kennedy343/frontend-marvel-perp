import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import TrasladoFormCard from '../components/TrasladoFormCard'

export default function CreateTrasladoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-7 motion-safe:animate-rise">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            to="/inventario/traslados"
            className="inline-flex items-center gap-1.5 font-dm-sans text-xs font-semibold text-gray-500 transition-colors hover:text-primary-blue"
          >
            <Icon name="icon-chevron-left" className="size-3.5" />
            Volver a Traslados
          </Link>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            Nuevo Traslado
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Registre el movimiento de productos entre dos sucursales.
          </p>
        </div>
      </div>

      <TrasladoFormCard />
    </div>
  )
}
