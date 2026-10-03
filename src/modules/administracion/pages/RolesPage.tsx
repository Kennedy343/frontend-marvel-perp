import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/common/Icon'
import { usuarioService } from '../services/usuarioService'
import { useAuthStore } from '../../../store/authStore'
import { tienePermiso } from '../../../lib/permisos'
import type { Rol } from '../types/usuario'

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'R'
}

function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const canCreateRol =
    tienePermiso(user?.permisos, 'crear:roles') &&
    tienePermiso(user?.permisos, 'crear:rol-permisos')
  const canEditPermisos = tienePermiso(user?.permisos, 'actualizar:rol-permisos')

  useEffect(() => {
    let active = true
    usuarioService
      .getRoles()
      .then((rolesData) => {
        if (active) setRoles(rolesData)
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los roles.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Administración <span className="mx-2">›</span> Ver roles</p>
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">Roles</h1>
          <p className="mt-2 text-sm text-gray-500">Crea roles y ajusta los permisos de cada uno.</p>
        </div>
        {canCreateRol ? (
          <Link
            to="/administracion/roles/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-navy-950 px-5 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
          >
            <Icon name="icon-plus-circle" className="size-4" />
            Nuevo rol
          </Link>
        ) : null}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-error-red">{error}</p>}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando roles…</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-gray-500">No hay roles para mostrar.</p>
        ) : (
          roles.map((rol) => (
            <article key={rol.idRol} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-sora text-lg font-semibold text-indigo-700">
                  {getInitials(rol.nombreRol)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-sora text-lg font-semibold text-navy-950">{rol.nombreRol}</h2>
                  <p className="mt-1 text-sm text-gray-500">Rol #{rol.idRol}</p>
                </div>
              </div>
              {canEditPermisos ? (
                <Link
                  to={`/administracion/roles/${rol.idRol}/permisos`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                >
                  <Icon name="icon-edit" className="size-4" />
                  Editar permisos
                </Link>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default RolesPage
