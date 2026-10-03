import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import UsuarioIdentityCard from '../components/UsuarioIdentityCard'
import UsuarioAccessCard from '../components/UsuarioAccessCard'
import UsuarioWizard from '../components/UsuarioWizard'
import { useEditarUsuario } from '../hooks/useEditarUsuario'
import { USUARIO_FORM_STEPS } from '../lib/usuarioForm'

function EditarUsuarioPage() {
  const navigate = useNavigate()
  const { idUsuario } = useParams()
  const id = Number(idUsuario)
  const [step, setStep] = useState(1)
  const {
    formData,
    errors,
    roles,
    sucursales,
    selectedRoles,
    selectedSucursales,
    isLoadingCatalogs,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    setRolesSelection,
    setSucursalesSelection,
    handleSubmit,
    validateStep,
  } = useEditarUsuario(id)

  const handleCancel = () => {
    navigate('/administracion/usuarios')
  }

  const handleStepChange = (next: number) => {
    if (next > step && !validateStep(step)) return
    setStep(next)
  }

  const onFormSubmit = async () => {
    const toastId = 'update-usuario'
    toast.loading('Guardando cambios…', { id: toastId })
    const ok = await handleSubmit(() => {
      const nombre =
        `${formData.nombreUsuario} ${formData.apellidoUsuario}`.trim()
      toast.success('Usuario actualizado', {
        id: toastId,
        description: nombre
          ? `${nombre} fue actualizado correctamente.`
          : 'El usuario fue actualizado correctamente.',
      })
      navigate('/administracion/usuarios')
    })
    if (!ok) {
      toast.error('No se pudo actualizar el usuario', {
        id: toastId,
        description: 'Revisa los datos marcados e inténtalo de nuevo.',
      })
    }
  }

  return (
    <UsuarioWizard
      breadcrumb={['Administración', 'Usuarios', 'Editar']}
      title="Editar Usuario"
      description="Actualice la información, roles y sucursales del usuario."
      steps={USUARIO_FORM_STEPS}
      step={step}
      onStepChange={handleStepChange}
      onSubmit={onFormSubmit}
      onCancel={handleCancel}
      submitLabel="Guardar cambios"
      savingLabel="Guardando cambios…"
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      isLoading={isLoadingCatalogs}
      feedbackError={feedbackError}
      assignmentSummary={{
        roles: selectedRoles.size,
        sucursales: selectedSucursales.size,
      }}
    >
      {step === 1 ? (
        <div className="max-w-3xl">
          <UsuarioIdentityCard
            formData={formData}
            errors={errors}
            onChange={handleChange}
            disabled={isSubmitting || isSuccess}
            passwordOptional
          />
        </div>
      ) : (
        <div className="max-w-3xl">
          <UsuarioAccessCard
            roles={roles}
            sucursales={sucursales}
            selectedRoles={selectedRoles}
            selectedSucursales={selectedSucursales}
            errors={errors}
            onRolesChange={setRolesSelection}
            onSucursalesChange={setSucursalesSelection}
            isLoadingCatalogs={isLoadingCatalogs}
            disabled={isSubmitting || isSuccess}
          />
        </div>
      )}
    </UsuarioWizard>
  )
}

export default EditarUsuarioPage
