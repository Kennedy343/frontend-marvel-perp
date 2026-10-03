import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import RolForm from '../components/RolForm'
import { usePermisosModulos } from '../hooks/usePermisosModulos'
import { usuarioService } from '../services/usuarioService'
import type { Rol } from '../types/usuario'

function EditarRolPermisosPage() {
  const navigate = useNavigate()
  const { idRol } = useParams()
  const id = Number(idRol)
  const { modulos, isLoading: isLoadingModulos } = usePermisosModulos()

  const [rol, setRol] = useState<Rol | null>(null)
  const [initialPermisos, setInitialPermisos] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([usuarioService.getRoles(), usuarioService.getRolPermisos(id)])
      .then(([roles, permisos]) => {
        if (!active) return
        const found = roles.find((item) => item.idRol === id)
        if (!found) {
          setError('No se encontró el rol.')
          return
        }
        setRol(found)
        setInitialPermisos(permisos)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los permisos del rol.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const goBack = () => navigate('/administracion/roles')

  const handleUpdate = async (_nombreRol: string, idPermisos: number[]) => {
    if (!rol) return

    const initial = new Set(initialPermisos)
    const selected = new Set(idPermisos)
    const calls: Promise<void>[] = []

    for (const idPermiso of idPermisos) {
      if (!initial.has(idPermiso)) {
        calls.push(usuarioService.createRolPermiso(rol.idRol, idPermiso))
      }
    }
    for (const idPermiso of initialPermisos) {
      if (!selected.has(idPermiso)) {
        calls.push(usuarioService.deleteRolPermiso(rol.idRol, idPermiso))
      }
    }
    await Promise.all(calls)

    setInitialPermisos(idPermisos)
    toast.success('Permisos actualizados', {
      description: `Los permisos de "${rol.nombreRol}" fueron actualizados.`,
    })
  }

  const loading = isLoading || isLoadingModulos

  return (
    <div className="mx-auto max-w-5xl space-y-6 motion-safe:animate-rise">
      <div>
        <p className="font-dm-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Administración <span className="mx-2">›</span> Roles <span className="mx-2">›</span> Editar permisos
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          Editar permisos
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">
          {rol ? `Ajusta los permisos de "${rol.nombreRol}".` : 'Ajusta los permisos del rol.'}
        </p>
      </div>

      {loading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-soft">
          Cargando permisos del rol…
        </p>
      ) : error || !rol ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          {error ?? 'No se encontró el rol.'}
        </div>
      ) : (
        <RolForm
          mode="edit"
          modulos={modulos}
          initialNombre={rol.nombreRol}
          initialPermisos={initialPermisos}
          onSubmit={handleUpdate}
          onSuccess={goBack}
          onCancel={goBack}
        />
      )}
    </div>
  )
}

export default EditarRolPermisosPage
