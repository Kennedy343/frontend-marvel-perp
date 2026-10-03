import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal'
import FeedbackBanner from '../components/FeedbackBanner'
import ProveedoresHeader from '../components/ProveedoresHeader'
import ProveedoresToolbar from '../components/ProveedoresToolbar'
import ProveedorList from '../components/ProveedorList'
import ProveedoresPagination from '../components/ProveedoresPagination'
import { useEliminarProveedor } from '../hooks/useEliminarProveedor'
import { useProveedores } from '../hooks/useProveedores'
import { proveedorService } from '../services/proveedorService'
import type { Departamento } from '../types/proveedor'

export default function ProveedoresPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const deferredSearch = useDeferredValue(search)

  const {
    proveedores,
    meta,
    isLoading,
    error,
    page,
    selectedDepartamento,
    setSelectedDepartamento,
    changePage,
    refetch,
  } = useProveedores(deferredSearch)

  const {
    proveedorAEliminar,
    isDeleting,
    feedbackMessage,
    requestDelete,
    cancelDelete,
    clearFeedback,
    confirmDelete,
  } = useEliminarProveedor(refetch)

  useEffect(() => {
    let isMounted = true
    proveedorService.getDepartamentos().then((deptos) => {
      if (isMounted) {
        setDepartamentos(deptos)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const departamentoOptions = useMemo(
    () =>
      departamentos.map((departamento) => ({
        value: departamento.idDepartamento,
        label: departamento.nombreDepartamento,
      })),
    [departamentos],
  )

  const hasSearch = deferredSearch.trim().length > 0

  const handleEdit = (idProveedor: number) => {
    navigate(`/proveedores/${idProveedor}/editar`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <ProveedoresHeader total={meta.total} isLoading={isLoading} />

      <FeedbackBanner message={feedbackMessage} onClose={clearFeedback} />

      <ProveedoresToolbar
        search={search}
        onSearchChange={setSearch}
        departamentoOptions={departamentoOptions}
        selectedDepartamento={selectedDepartamento}
        onDepartamentoChange={setSelectedDepartamento}
      />

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
        <ProveedorList
          proveedores={proveedores}
          isLoading={isLoading}
          hasSearch={hasSearch}
          onEdit={handleEdit}
          onDelete={requestDelete}
          footer={
            !isLoading ? (
              <ProveedoresPagination
                page={page}
                currentCount={proveedores.length}
                meta={meta}
                onChangePage={changePage}
              />
            ) : undefined
          }
        />
      )}

      <DeleteConfirmationModal
        open={Boolean(proveedorAEliminar)}
        title="Eliminar proveedor"
        message={`¿Estás seguro de que deseas eliminar al proveedor "${proveedorAEliminar?.nombre}"?`}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
