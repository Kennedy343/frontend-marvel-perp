import { memo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../../components/ui/chart'
import { formatCurrency } from '../../../lib/format'
import type { EstadisticasPorPeriodo } from '../../ventas/hooks/useEstadisticasVentas'
import { PERIODOS_META } from './periodosMeta'

interface DatoGrafico {
  label: string
  monto: number
}

// Hoisted static value (Vercel Best Practice: prefer-module-scope-static-value)
const chartConfig = {
  monto: { label: 'Ventas', color: 'var(--color-primary-blue)' },
} satisfies ChartConfig

function formatAxisCompact(value: number): string {
  if (value >= 1000) {
    const miles = (value / 1000).toLocaleString('es-GT', {
      maximumFractionDigits: 1,
    })
    return `Q${miles}k`
  }
  return `Q${Math.round(value)}`
}

interface VentasComparativoChartProps {
  data: EstadisticasPorPeriodo
}

export const VentasComparativoChart = memo(function VentasComparativoChart({
  data,
}: VentasComparativoChartProps) {
  const chartData: DatoGrafico[] = PERIODOS_META.map((meta) => ({
    label: meta.label,
    monto: data[meta.periodo]?.montoTotal ?? 0,
  }))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-6">
      <div>
        <p className="font-dm-sans text-xs font-semibold uppercase tracking-wider text-primary-blue">
          Comparativo por periodo
        </p>
        <h3 className="mt-1 font-sora text-base font-semibold tracking-tight text-navy-950">
          Monto de ventas acumulado
        </h3>
      </div>

      <div className="mt-5">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(value) => formatAxisCompact(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const dato = (item as { payload?: DatoGrafico })?.payload
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {dato?.label ?? 'Ventas'}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey="monto" fill="var(--color-monto)" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
})
