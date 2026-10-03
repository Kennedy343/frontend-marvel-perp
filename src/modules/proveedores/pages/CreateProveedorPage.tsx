import { useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ProveedorFormActions from '../components/ProveedorFormActions'
import ProveedorFormHeader from '../components/ProveedorFormHeader'
import ProveedorInfoCard from '../components/ProveedorInfoCard'
import ProveedorUbicacionCard from '../components/ProveedorUbicacionCard'
import { useCreateProveedor } from '../hooks/useCreateProveedor'

const REQUIRED_FIELDS_TOTAL = 3

export default function CreateProveedorPage() {
  const navigate = useNavigate()
  const {
    formData,
    errors,
    departamentos,
    isLoadingCatalogs,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    addDepartamento,
  } = useCreateProveedor()

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
    const nombre = formData.nombreProveedor.trim()
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-proveedor',
          loading: 'Registrando proveedor…',
          success: {
            message: 'Proveedor creado',
            description: nombre
              ? `${nombre} fue registrado correctamente.`
              : 'El proveedor fue registrado correctamente.',
          },
          error: {
            message: 'No se pudo registrar el proveedor',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/proveedores'))
      .catch(() => {})
  }

  const handleCancel = () => {
    navigate('/proveedores')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 motion-safe:animate-rise">
      <ProveedorFormHeader
        breadcrumbLabel="Crear"
        title="Nuevo Proveedor"
        subtitle="Complete la información para registrar un nuevo proveedor en el sistema."
      />

      <form onSubmit={onFormSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <ProveedorInfoCard
            formData={formData}
            errors={errors}
            onChange={handleChange}
            disabled={isSubmitting || isSuccess || isLoadingCatalogs}
          />

          <ProveedorUbicacionCard
            formData={formData}
            errors={errors}
            departamentos={departamentos}
            onChange={handleChange}
            onDepartamentoCreated={addDepartamento}
            disabled={isSubmitting || isSuccess || isLoadingCatalogs}
          />
        </div>

        <ProveedorFormActions
          requiredFieldsFilled={requiredFieldsFilled}
          requiredFieldsTotal={REQUIRED_FIELDS_TOTAL}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          submitLabel="Guardar Proveedor"
          loadingSubmitLabel="Guardando proveedor…"
          onCancel={handleCancel}
        />
      </form>
    </div>
  )
}
