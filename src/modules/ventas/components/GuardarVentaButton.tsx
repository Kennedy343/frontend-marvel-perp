import { memo } from 'react'
import Icon from '../../../components/common/Icon'

interface GuardarVentaButtonProps {
  isSubmitting: boolean
  canSubmit: boolean
  onGuardar: () => void
}

export const GuardarVentaButton = memo(function GuardarVentaButton({
  isSubmitting,
  canSubmit,
  onGuardar,
}: GuardarVentaButtonProps) {
  return (
    <button
      type="button"
      disabled={isSubmitting || !canSubmit}
      onClick={onGuardar}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-blue px-5 py-3 font-dm-sans text-sm font-semibold text-white shadow-soft transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Registrando venta…</span>
        </>
      ) : (
        <>
          <Icon name="icon-check" className="size-4" />
          <span>Guardar venta</span>
        </>
      )}
    </button>
  )
})
