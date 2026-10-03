import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import RolForm from '../components/RolForm'
import { usePermisosModulos } from '../hooks/usePermisosModulos'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../../../store/authStore'
import { tienePermiso } from '../../../lib/permisos'

function CreateRolPage() {
  const navigate = useNavigate()
  const { modulos, isLoading } = usePermisosModulos()
  const user = useAuthStore((state) => state.user)
  const canAssignPermisos = tienePermiso(user?.permisos, 'crear:rol-permisos')

  const goBack = () => navigate('/administracion/roles')

  const handleCreate = async (nombreRol: string, idPermisos: number[]) => {
    const rol = await usuarioService.createRol(nombreRol)
    const permisosAsignables = canAssignPermisos ? idPermisos : []
    if (permisosAsignables.length > 0) {
      await Promise.all(
        permisosAsignables.map((idPermiso) =>
          usuarioService.createRolPermiso(rol.idRol, idPermiso),
        ),
      )
    }
    toast.success('Rol creado', {
      description: `"${nombreRol}" fue creado correctamente.`,
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 motion-safe:animate-rise">
      <div>
        <p className="font-dm-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Administración <span className="mx-2">›</span> Roles <span className="mx-2">›</span> Nuevo
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Nuevo rol
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          Define el nombre y los permisos del nuevo rol.
        </p>
      </div>

      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-soft">
          Cargando permisos…
        </p>
      ) : (
        <RolForm
          mode="create"
          modulos={modulos}
          permissionsDisabled={!canAssignPermisos}
          onSubmit={handleCreate}
          onSuccess={goBack}
          onCancel={goBack}
        />
      )}
    </div>
  )
}

export default CreateRolPage
