import { useAuthStore } from '../../../store/authStore'
import LiveDateTimeCard from '../components/LiveDateTimeCard'
import EstadisticasVentasSection from '../components/EstadisticasVentasSection'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.nombreCompleto?.split(' ')[0] || 'Usuario'

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">
            Panel de control
          </p>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido al sistema de gestión y planificación de recursos Marvel ERP.
          </p>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <LiveDateTimeCard />
        </div>
      </div>

      <EstadisticasVentasSection />
    </div>
  )
}

export default DashboardPage
