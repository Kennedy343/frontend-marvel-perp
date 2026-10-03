import Icon from '../../../components/common/Icon'
import type { FeedbackMessage } from '../types/proveedor'

interface FeedbackBannerProps {
  message: FeedbackMessage | null
  onClose?: () => void
}

export default function FeedbackBanner({ message, onClose }: FeedbackBannerProps) {
  if (!message) return null

  const isSuccess = message.type === 'success'

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
          : 'border-red-200 bg-red-50/90 text-error-red'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-white ${
            isSuccess ? 'bg-emerald-600' : 'bg-error-red'
          }`}
        >
          <Icon name={isSuccess ? 'icon-check' : 'icon-close'} className="size-3.5" />
        </span>
        <p>{message.text}</p>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-semibold opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          Cerrar
        </button>
      ) : null}
    </div>
  )
}
