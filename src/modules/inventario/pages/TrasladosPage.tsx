import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import { useTraslados } from '../hooks/useTraslados'
import { trasladoService } from '../services/trasladoService'
import { TrasladosFilters } from '../components/TrasladosFilters'
import { TrasladosList } from '../components/TrasladosList'
import TrasladosPagination from '../components/TrasladosPagination'
import DetalleTrasladoModal from '../components/DetalleTrasladoModal'
import AccionTrasladoModal, {
  type AccionTrasladoMode,
} from '../components/AccionTrasladoModal'
import type { Traslado } from '../types/traslado'

function extractError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data.message === 'string') return data.message
    if (Array.isArray(data?.message) && data.message.length > 0) {
      return data.message.join('. ')
    }
    if (error.response?.status === 403) {
      return 'No tienes permiso para realizar esta acción (403).'
    }
    if (error.response?.status === 409) {
      return 'La acción no es válida para el estado actual del traslado.'
    }
  }
  return fallback
}

function buildMensajeAccion(
  mode: AccionTrasladoMode,
  idTraslado: number,
): { title: string; description: string } {
  if (mode === 'enviar') {
    return {
      title: 'Traslado enviado',
      description: `El traslado #${idTraslado} fue enviado y está a la espera de recepción.`,
    }
  }

  if (mode === 'recibir') {
    return {
      title: 'Traslado recibido',
      description: `El traslado #${idTraslado} fue recibido y el stock ingresó en la sucursal de destino.`,
    }
  }

  return {
    title: 'Traslado anulado',
    description: `El traslado #${idTraslado} fue anulado y, si estaba enviado, el stock regresó a la sucursal de origen.`,
  }
}

export default function TrasladosPage() {
  const {
    filteredTraslados,
    meta,
    isLoading,
    error,
    estado,
    setEstado,
    search,
    setSearch,
    page,
    changePage,
    refresh,
  } = useTraslados()

  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const [detalleOpen, setDetalleOpen] = useState(false)
  const [trasladoDetalle, setTrasladoDetalle] = useState<Traslado | null>(null)
  const [isDetalleLoading, setIsDetalleLoading] = useState(false)

  const [trasladoAccion, setTrasladoAccion] = useState<Traslado | null>(null)
  const [accionMode, setAccionMode] = useState<AccionTrasladoMode | null>(null)
  const [isAccionando, setIsAccionando] = useState(false)
  const [accionError, setAccionError] = useState<string | null>(null)
  const [motivo, setMotivo] = useState('')

  const openDetalle = async (traslado: Traslado) => {
    setTrasladoDetalle(null)
    setDetalleOpen(true)
    setIsDetalleLoading(true)
    try {
      const detalle = await trasladoService.getById(traslado.idTraslado)
      setTrasladoDetalle(detalle)
    } catch (err) {
      console.error('Error al cargar detalle de traslado:', err)
      setDetalleOpen(false)
      setFeedbackError('No se pudo cargar el detalle del traslado.')
    } finally {
      setIsDetalleLoading(false)
    }
  }

  const closeDetalle = () => {
    setDetalleOpen(false)
    setTrasladoDetalle(null)
  }

  const openAccion = (traslado: Traslado, mode: AccionTrasladoMode) => {
    setTrasladoAccion(traslado)
    setAccionMode(mode)
    setMotivo('')
    setAccionError(null)
  }

  const closeAccion = () => {
    setTrasladoAccion(null)
    setAccionMode(null)
    setMotivo('')
    setAccionError(null)
  }

  const handleConfirmAccion = async () => {
    if (!trasladoAccion || !accionMode) return
    const { idTraslado } = trasladoAccion

    try {
      setIsAccionando(true)
      setAccionError(null)

      if (accionMode === 'enviar') {
        await trasladoService.enviar(idTraslado)
      } else if (accionMode === 'recibir') {
        await trasladoService.recibir(idTraslado)
      } else {
        await trasladoService.anular(idTraslado, motivo.trim() || undefined)
      }

      const mensaje = buildMensajeAccion(accionMode, idTraslado)
      toast.success(mensaje.title, { description: mensaje.description })
      closeAccion()
      refresh()
    } catch (err) {
      console.error('Error al ejecutar acción de traslado:', err)
      setAccionError(extractError(err, 'No se pudo completar la acción sobre el traslado.'))
    } finally {
      setIsAccionando(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">
            Inventario
          </p>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            Traslados
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Gestione los traslados de productos entre sucursales: envío, recepción y
            anulación.
          </p>
        </div>
        <Link
          to="/inventario/traslados/crear"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950"
        >
          <Icon name="icon-plus" className="size-4" />
          <span>Nuevo Traslado</span>
        </Link>
      </div>

      {feedbackError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-error-red text-white">
              <Icon name="icon-close" className="size-3.5" />
            </span>
            <p>{feedbackError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackError(null)}
            className="text-xs font-semibold opacity-80 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      <TrasladosFilters
        search={search}
        onSearchChange={setSearch}
        estado={estado}
        onEstadoChange={setEstado}
        onReset={() => {
          setSearch('')
          setEstado(undefined)
        }}
        onRefresh={refresh}
        loading={isLoading}
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
          <TrasladosList
            traslados={filteredTraslados}
            isLoading={isLoading}
            onVerDetalle={openDetalle}
            onEnviar={(t) => openAccion(t, 'enviar')}
            onRecibir={(t) => openAccion(t, 'recibir')}
            onAnular={(t) => openAccion(t, 'anular')}
          />
          {!isLoading && (
            <TrasladosPagination
              page={page}
              currentCount={filteredTraslados.length}
              meta={meta}
              onChangePage={changePage}
            />
          )}
        </div>
      )}

      <DetalleTrasladoModal
        open={detalleOpen}
        traslado={trasladoDetalle}
        isLoading={isDetalleLoading}
        onClose={closeDetalle}
      />

      <AccionTrasladoModal
        open={trasladoAccion !== null}
        traslado={trasladoAccion}
        mode={accionMode}
        isLoading={isAccionando}
        error={accionError}
        motivo={motivo}
        onMotivoChange={setMotivo}
        onConfirm={handleConfirmAccion}
        onClose={closeAccion}
      />
    </div>
  )
}
