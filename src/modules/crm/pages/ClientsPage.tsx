import { useCallback, useDeferredValue, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal'
import ClientList from '../components/ClientList'
import ClientsHeader from '../components/ClientsHeader'
import ClientsPagination from '../components/ClientsPagination'
import ClientsToolbar from '../components/ClientsToolbar'
import { clientService } from '../services/clientService'
import { useClients } from '../hooks/useClients'
import { getFullName } from '../lib/clientIdentity'
import type { Client } from '../types/client'

interface FeedbackMessage {
  type: 'success' | 'error'
  text: string
}

interface ClientToDelete {
  id: number
  nombre: string
}

function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clienteAEliminar, setClienteAEliminar] = useState<ClientToDelete | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null)
  const deferredSearch = useDeferredValue(search)
  const { clients, meta, isLoading, error, page, changePage, refetch } = useClients(deferredSearch)

  const handleEdit = useCallback(
    (idCliente: number) => navigate(`/crm/clientes/${idCliente}/editar`),
    [navigate],
  )

  const handleDeleteRequest = useCallback((client: Client) => {
    setClienteAEliminar({
      id: client.idCliente,
      nombre: getFullName(client.primerNombre, client.primerApellido),
    })
  }, [])

  const handleEliminar = async () => {
    if (!clienteAEliminar) return
    try {
      setIsDeleting(true)
      await clientService.remove(clienteAEliminar.id)
      setFeedbackMessage({
        type: 'success',
        text: `Cliente "${clienteAEliminar.nombre}" eliminado exitosamente.`,
      })
      setClienteAEliminar(null)
      refetch()
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      setFeedbackMessage({
        type: 'error',
        text: 'No se pudo eliminar el cliente. Intente nuevamente.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const hasSearch = deferredSearch.trim().length > 0

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <ClientsHeader total={meta.total} isLoading={isLoading} />

      {feedbackMessage ? (
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
            className="text-xs font-semibold opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-primary-blue"
          >
            Cerrar
          </button>
        </div>
      ) : null}

      <ClientsToolbar search={search} onSearchChange={setSearch} />

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
              <Icon name="icon-close" className="size-3.5" />
            </span>
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-1.5 rounded-lg border border-error-red/40 bg-white px-3 py-1.5 text-xs font-semibold text-error-red transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-red"
          >
            <Icon name="icon-refresh" className="size-3.5" />
            Reintentar
          </button>
        </div>
      ) : (
        <ClientList
          clients={clients}
          isLoading={isLoading}
          hasSearch={hasSearch}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          footer={
            !isLoading ? (
              <ClientsPagination
                page={page}
                currentCount={clients.length}
                meta={meta}
                onChangePage={changePage}
              />
            ) : undefined
          }
        />
      )}

      <DeleteConfirmationModal
        open={Boolean(clienteAEliminar)}
        title="Eliminar cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${clienteAEliminar?.nombre}"?`}
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onCancel={() => setClienteAEliminar(null)}
      />
    </div>
  )
}

export default ClientsPage
