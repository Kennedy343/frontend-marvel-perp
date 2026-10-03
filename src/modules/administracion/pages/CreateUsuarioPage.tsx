import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import UsuarioIdentityCard from '../components/UsuarioIdentityCard'
import UsuarioAccessCard from '../components/UsuarioAccessCard'
import RolBuilderDialog from '../components/RolBuilderDialog'
import UsuarioWizard from '../components/UsuarioWizard'
import { useCreateUsuario } from '../hooks/useCreateUsuario'
import { useAuthStore } from '../../../store/authStore'
import { USUARIO_FORM_STEPS } from '../lib/usuarioForm'
import { tienePermiso } from '../../../lib/permisos'

function CreateUsuarioPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isRolDialogOpen, setIsRolDialogOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const canCreateRol =
    tienePermiso(user?.permisos, 'crear:roles') &&
    tienePermiso(user?.permisos, 'crear:rol-permisos')
  const {
    formData,
    errors,
    roles,
    sucursales,
    modulos,
    selectedRoles,
    selectedSucursales,
    isLoadingCatalogs,
    isSubmitting,
    isSuccess,
    feedbackError,
    handleChange,
    setRolesSelection,
    setSucursalesSelection,
    crearRol,
    handleSubmit,
    validateStep,
  } = useCreateUsuario()

  const handleCancel = () => {
    navigate('/administracion/usuarios')
  }

  const handleStepChange = (next: number) => {
    if (next > step && !validateStep(step)) return
    setStep(next)
  }

  const handleCreateRol = async (nombreRol: string, idPermisos: number[]) => {
    await crearRol(nombreRol, idPermisos)
    toast.success('Rol creado', {
      description: `"${nombreRol}" fue creado y asignado al usuario.`,
    })
  }

  const onFormSubmit = async () => {
    const nombreCompleto =
      `${formData.nombreUsuario} ${formData.apellidoUsuario}`.trim()
    toast
      .promise(
        (async () => {
          const ok = await handleSubmit()
          if (!ok) throw new Error('create-failed')
          return ok
        })(),
        {
          id: 'create-usuario',
          loading: 'Registrando usuario…',
          success: {
            message: 'Usuario creado',
            description: nombreCompleto
              ? `${nombreCompleto} fue registrado correctamente.`
              : 'El usuario fue registrado correctamente.',
          },
          error: {
            message: 'No se pudo registrar el usuario',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/administracion/usuarios'))
      .catch(() => {})
  }

  return (
    <>
      <UsuarioWizard
        breadcrumb={['Administración', 'Usuarios', 'Nuevo']}
        title="Nuevo Usuario"
        description="Complete la información y asigne los roles y sucursales del nuevo usuario."
        steps={USUARIO_FORM_STEPS}
        step={step}
        onStepChange={handleStepChange}
        onSubmit={onFormSubmit}
        onCancel={handleCancel}
        submitLabel="Guardar usuario"
        savingLabel="Guardando usuario…"
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
              onCreateRol={() => setIsRolDialogOpen(true)}
              canCreateRol={canCreateRol}
              disabled={isSubmitting || isSuccess}
            />
          </div>
        )}
      </UsuarioWizard>

      {canCreateRol ? (
        <RolBuilderDialog
          open={isRolDialogOpen}
          modulos={modulos}
          onClose={() => setIsRolDialogOpen(false)}
          onSubmit={handleCreateRol}
          disabled={isSubmitting || isSuccess}
        />
      ) : null}
    </>
  )
}

export default CreateUsuarioPage
