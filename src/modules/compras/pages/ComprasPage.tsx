import { useState } from 'react'
import { isAxiosError } from 'axios'
import Icon from '../../../components/common/Icon'
import { compraService } from '../services/compraService'
import { useCompras } from '../hooks/useCompras'
import ComprasHeader from '../components/ComprasHeader'
import ComprasFilters from '../components/ComprasFilters'
import ComprasList from '../components/ComprasList'
import ComprasPagination from '../components/ComprasPagination'
import DetalleCompraModal from '../components/DetalleCompraModal'
import AnularCompraModal from '../components/AnularCompraModal'
import type { Compra } from '../types/compra'

function extractAnularError(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data.message === 'string') {
      return data.message
    }
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join('. ')
    }
    if (error.response?.status === 409) {
      return 'La compra ya se encuentra anulada.'
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para anular esta compra (403).'
    }
  }
  return 'No se pudo anular la compra. Intente nuevamente.'
}

function ComprasPage() {
  const [search, setSearch] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFinal, setFechaFinal] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const [compraDetalle, setCompraDetalle] = useState<Compra | null>(null)
  const [isDetalleLoading, setIsDetalleLoading] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)

  const [compraAnular, setCompraAnular] = useState<Compra | null>(null)
  const [isAnulando, setIsAnulando] = useState(false)
  const [anularError, setAnularError] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  const { compras, meta, isLoading, error, page, changePage, refetch } = useCompras({
    search,
    fechaInicio,
    fechaFinal,
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    changePage(1)
  }

  const handleFechaInicioChange = (value: string) => {
    setFechaInicio(value)
    changePage(1)
  }

  const handleFechaFinalChange = (value: string) => {
    setFechaFinal(value)
    changePage(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setFechaInicio('')
    setFechaFinal('')
    changePage(1)
  }

  const openDetalle = async (compra: Compra) => {
    setCompraDetalle(null)
    setDetalleOpen(true)
    setIsDetalleLoading(true)
    try {
      const detalle = await compraService.getById(compra.idCompra)
      setCompraDetalle(detalle)
    } catch (err) {
      console.error('Error al cargar detalle de compra:', err)
      setFeedbackMessage({
        type: 'error',
        text: 'No se pudo cargar el detalle de la compra. Intente nuevamente.',
      })
      setDetalleOpen(false)
    } finally {
      setIsDetalleLoading(false)
    }
  }

  const closeDetalle = () => {
    setDetalleOpen(false)
    setCompraDetalle(null)
  }

  const openAnular = (compra: Compra) => {
    setCompraAnular(compra)
    setMotivo('')
    setAnularError(null)
  }

  const closeAnular = () => {
    setCompraAnular(null)
    setMotivo('')
    setAnularError(null)
  }

  const handleAnular = async () => {
    if (!compraAnular || !motivo.trim()) return
    try {
      setIsAnulando(true)
      setAnularError(null)
      await compraService.anular(compraAnular.idCompra, motivo.trim())
      setFeedbackMessage({
        type: 'success',
        text: `Compra ${compraAnular.serieFactura} - ${compraAnular.numeroFactura} anulada exitosamente.`,
      })
      closeAnular()
      refetch()
    } catch (err) {
      console.error('Error al anular compra:', err)
      setAnularError(extractAnularError(err))
    } finally {
      setIsAnulando(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <ComprasHeader total={meta.total} isLoading={isLoading} />

      {feedbackMessage && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
              : 'border-red-200 bg-red-50/90 text-error-red'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex size-6 items-center justify-center rounded-full text-white ${
                feedbackMessage.type === 'success' ? 'bg-emerald-600' : 'bg-error-red'
              }`}
            >
              <Icon
                name={feedbackMessage.type === 'success' ? 'icon-check' : 'icon-close'}
                className="size-3.5"
              />
            </span>
            <p>{feedbackMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="space-y-4">
        <ComprasFilters
          search={search}
          onSearchChange={handleSearchChange}
          fechaInicio={fechaInicio}
          onFechaInicioChange={handleFechaInicioChange}
          fechaFinal={fechaFinal}
          onFechaFinalChange={handleFechaFinalChange}
          onReset={handleResetFilters}
        />

        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-8 text-center text-sm font-medium text-error-red"
          >
            {error}
          </p>
        ) : (
          <div className="space-y-0">
            <ComprasList
              compras={compras}
              isLoading={isLoading}
              onVer={openDetalle}
              onAnular={openAnular}
            />
            {!isLoading && (
              <ComprasPagination
                page={page}
                currentCount={compras.length}
                meta={meta}
                onChangePage={changePage}
              />
            )}
          </div>
        )}
      </div>

      <DetalleCompraModal
        open={detalleOpen}
        compra={compraDetalle}
        isLoading={isDetalleLoading}
        onClose={closeDetalle}
      />

      <AnularCompraModal
        open={Boolean(compraAnular)}
        compra={compraAnular}
        isLoading={isAnulando}
        error={anularError}
        motivo={motivo}
        onMotivoChange={setMotivo}
        onConfirm={handleAnular}
        onClose={closeAnular}
      />
    </div>
  )
}

export default ComprasPage