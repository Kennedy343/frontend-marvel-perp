import { useEffect, useEffectEvent, useRef } from 'react'
import Icon from '../../../components/common/Icon'
import type { Traslado } from '../types/traslado'

export type AccionTrasladoMode = 'enviar' | 'recibir' | 'anular'

interface AccionTrasladoModalProps {
  open: boolean
  traslado: Traslado | null
  mode: AccionTrasladoMode | null
  isLoading: boolean
  error: string | null
  motivo: string
  onMotivoChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

const CONFIG: Record<
  AccionTrasladoMode,
  {
    title: string
    description: string
    confirmLabel: string
    loadingLabel: string
    icon: 'icon-transfer' | 'icon-check' | 'icon-trash'
    iconWrapper: string
    buttonClass: string
  }
> = {
  enviar: {
    title: 'Enviar traslado',
    description:
      'Se descontará el stock de la sucursal de origen. El traslado quedará en estado enviado y a la espera de recepción.',
    confirmLabel: 'Enviar traslado',
    loadingLabel: 'Enviando…',
    icon: 'icon-transfer',
    iconWrapper: 'bg-blue-50 text-primary-blue',
    buttonClass: 'bg-primary-blue hover:bg-blue-700 focus-visible:outline-primary-blue',
  },
  recibir: {
    title: 'Recibir traslado',
    description:
      'Se ingresará el stock a la sucursal de destino. Esta acción cierra el traslado y no se puede deshacer.',
    confirmLabel: 'Recibir traslado',
    loadingLabel: 'Recibiendo…',
    icon: 'icon-check',
    iconWrapper: 'bg-emerald-50 text-emerald-700',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600',
  },
  anular: {
    title: 'Anular traslado',
    description:
      'Si el traslado ya fue enviado, el stock descontado se devolverá a la sucursal de origen. Esta acción no se puede deshacer.',
    confirmLabel: 'Anular traslado',
    loadingLabel: 'Anulando…',
    icon: 'icon-trash',
    iconWrapper: 'bg-red-50 text-error-red',
    buttonClass: 'bg-error-red hover:bg-red-700 focus-visible:outline-error-red',
  },
}

function AccionTrasladoModal({
  open,
  traslado,
  mode,
  isLoading,
  error,
  motivo,
  onMotivoChange,
  onConfirm,
  onClose,
}: AccionTrasladoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleClose = useEffectEvent(() => {
    if (!isLoading) onClose()
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      handleClose()
    }
    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) handleClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleBackdropClick)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [])

  if (!mode) return null

  const config = CONFIG[mode]
  const disabled = mode === 'anular' && !motivo.trim()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="accion-traslado-title"
      className="m-auto w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-6 shadow-card backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full ${config.iconWrapper}`}
        >
          <Icon name={config.icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="accion-traslado-title"
            className="font-sora text-lg font-semibold text-navy-950"
          >
            {config.title}
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            {traslado ? `Traslado #${traslado.idTraslado}. ` : ''}
            {config.description}
          </p>
        </div>
      </div>

      {mode === 'anular' && (
        <div className="mt-5">
          <label
            htmlFor="motivoAnulacionTraslado"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
          >
            Motivo de anulación <span className="text-error-red">*</span>
          </label>
          <textarea
            id="motivoAnulacionTraslado"
            name="motivoAnulacionTraslado"
            value={motivo}
            onChange={(e) => onMotivoChange(e.target.value)}
            disabled={isLoading}
            maxLength={255}
            rows={3}
            placeholder="Describa el motivo de la anulación…"
            className={`mt-1.5 w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
              error
                ? 'border-error-red bg-red-50/30 text-error-red focus:border-error-red focus:ring-red-200'
                : 'border-gray-200 bg-white text-navy-950 hover:border-gray-300 focus:border-primary-blue'
            }`}
          />
          {error ? (
            <p className="mt-1 text-xs font-medium text-error-red">{error}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">{motivo.length}/255</p>
          )}
        </div>
      )}

      {mode !== 'anular' && error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-error-red">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled || isLoading}
          className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${config.buttonClass}`}
        >
          {isLoading ? config.loadingLabel : config.confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default AccionTrasladoModal
