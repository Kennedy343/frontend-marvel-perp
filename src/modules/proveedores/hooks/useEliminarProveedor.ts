import { useCallback, useState } from 'react'
import { proveedorService } from '../services/proveedorService'
import type { FeedbackMessage, ProveedorToDelete } from '../types/proveedor'

export function useEliminarProveedor(onDeleted?: () => void) {
  const [proveedorAEliminar, setProveedorAEliminar] = useState<ProveedorToDelete | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null)

  const requestDelete = useCallback((proveedor: ProveedorToDelete) => {
    setProveedorAEliminar(proveedor)
  }, [])

  const cancelDelete = useCallback(() => {
    setProveedorAEliminar(null)
  }, [])

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!proveedorAEliminar) return
    setIsDeleting(true)
    try {
      await proveedorService.remove(proveedorAEliminar.id)
      setFeedbackMessage({
        type: 'success',
        text: `Proveedor "${proveedorAEliminar.nombre}" eliminado exitosamente.`,
      })
      setProveedorAEliminar(null)
      onDeleted?.()
    } catch (err) {
      console.error('Error al eliminar proveedor:', err)
      setFeedbackMessage({
        type: 'error',
        text: 'No se pudo eliminar el proveedor. Intente nuevamente.',
      })
    } finally {
      setIsDeleting(false)
    }
  }, [proveedorAEliminar, onDeleted])

  return {
    proveedorAEliminar,
    isDeleting,
    feedbackMessage,
    requestDelete,
    cancelDelete,
    clearFeedback,
    confirmDelete,
  }
}
