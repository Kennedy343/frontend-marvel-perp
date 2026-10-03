import { memo, useMemo } from 'react'
import Icon from '../../../components/common/Icon'

// Hoisted formatters to module scope (Vercel Best Practice: prefer-module-scope-static-value)
const fullDateFormatter = new Intl.DateTimeFormat('es-GT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatCapitalizedDate(date: Date): string {
  const formatted = fullDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function LiveDateTimeCard() {
  const formattedDate = useMemo(() => {
    return formatCapitalizedDate(new Date())
  }, [])

  return (
    <article
      aria-label="Fecha actual"
      className="flex items-center gap-3.5 rounded-2xl border border-gray-200/80 bg-white px-5 py-3.5 shadow-soft transition-[border-color,box-shadow] duration-200 hover:border-primary-blue/30 hover:shadow-card motion-safe:animate-rise"
    >
      {/* Icono de calendario con acento azul */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary-blue shadow-sm">
        <Icon name="icon-calendar" className="size-5" />
      </div>

      {/* Fecha con tono gris refinado y legible */}
      <p className="font-sora text-sm font-medium tracking-tight text-gray-600 sm:text-base">
        {formattedDate}
      </p>
    </article>
  )
}

export default memo(LiveDateTimeCard)
