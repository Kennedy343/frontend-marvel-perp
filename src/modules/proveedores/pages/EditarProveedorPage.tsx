import { useMemo, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ProveedorFormActions from '../components/ProveedorFormActions'
import ProveedorFormHeader from '../components/ProveedorFormHeader'
import ProveedorFormSkeleton from '../components/ProveedorFormSkeleton'
import ProveedorInfoCard from '../components/ProveedorInfoCard'
import ProveedorUbicacionCard from '../components/ProveedorUbicacionCard'
import { useEditarProveedor } from '../hooks/useEditarProveedor'

const REQUIRED_FIELDS_TOTAL = 3

export default function EditarProveedorPage() {
  const navigate = useNavigate()
  const { idProveedor } = useParams()
  const id = Number(idProveedor)

  const {
    proveedor,
    formData,
    errors,
    departamentos,
    isLoading,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    addDepartamento,
  } = useEditarProveedor(id)

  const requiredFieldsFilled = useMemo(
    () =>
      [formData.nombreProveedor, formData.nitProveedor, formData.idDepartamento].filter(
        (value) => value.trim() !== '',
      ).length,
    [formData.nombreProveedor, formData.nitProveedor, formData.idDepartamento],
  )

  const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (e.target !== e.currentTarget) return
    const toastId = 'update-proveedor'
    toast.loading('Guardando cambios…', { id: toastId })
    const ok = await handleSubmit(() => {
      const nombre = formData.nombreProveedor.trim()
      toast.success('Proveedor actualizado', {
        id: toastId,
        description: nombre
          ? `${nombre} fue actualizado correctamente.`
          : 'El proveedor fue actualizado correctamente.',
      })
      navigate('/proveedores')
    })
    if (!ok) {
      toast.error('No se pudo actualizar el proveedor', {
        id: toastId,
        description: 'Revisa los datos marcados e inténtalo de nuevo.',
      })
    }
  }

  const handleCancel = () => {
    navigate('/proveedores')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 motion-safe:animate-rise">
      <ProveedorFormHeader
        breadcrumbLabel="Editar"
        title="Editar Proveedor"
        subtitle={
          proveedor
            ? `Modificando los datos de ${proveedor.nombreProveedor}`
            : 'Actualice la información del proveedor.'
        }
      />

      {isLoading ? (
        <ProveedorFormSkeleton />
      ) : (
        <form onSubmit={onFormSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <ProveedorInfoCard
              formData={formData}
              errors={errors}
              onChange={handleChange}
              disabled={isSubmitting || isSuccess}
            />

            <ProveedorUbicacionCard
              formData={formData}
              errors={errors}
              departamentos={departamentos}
              onChange={handleChange}
              onDepartamentoCreated={addDepartamento}
              disabled={isSubmitting || isSuccess}
            />
          </div>

          <ProveedorFormActions
            requiredFieldsFilled={requiredFieldsFilled}
            requiredFieldsTotal={REQUIRED_FIELDS_TOTAL}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
            submitLabel="Guardar Cambios"
            loadingSubmitLabel="Guardando cambios…"
            onCancel={handleCancel}
          />
        </form>
      )}
    </div>
  )
}
