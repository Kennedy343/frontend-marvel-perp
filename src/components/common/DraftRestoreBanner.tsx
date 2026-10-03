import Icon from './Icon'

interface DraftRestoreBannerProps {
  savedAt: number
  onDiscard: () => void
}

function formatRelativeTime(timestamp: number): string {
  const elapsedMs = Date.now() - timestamp
  const minutes = Math.floor(elapsedMs / 60000)
  if (minutes < 1) return 'hace unos segundos'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  const days = Math.floor(hours / 24)
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`
}

function DraftRestoreBanner({ savedAt, onDiscard }: DraftRestoreBannerProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-blue text-white">
          <Icon name="icon-refresh" className="size-4" />
        </span>
        <div>
          <p className="font-dm-sans text-sm font-semibold text-blue-900">
            Se restauró un borrador guardado {formatRelativeTime(savedAt)}
          </p>
          <p className="font-dm-sans text-xs text-blue-700">
            Verifica precios y existencias; pueden haber cambiado desde entonces.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDiscard}
        className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 font-dm-sans text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
      >
        Descartar borrador
      </button>
    </div>
  )
}

export default DraftRestoreBanner
