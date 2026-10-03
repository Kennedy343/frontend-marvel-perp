import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../../components/common/Icon'
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal'
import { useUsuarios } from '../hooks/useUsuarios'
import { usuarioService } from '../services/usuarioService'

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
}

function UsuariosPage() {
  const [search, setSearch] = useState('')
  const { usuarios, meta, isLoading, error, page, changePage, reload } = useUsuarios(search)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<{ id: number; nombreCompleto: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return
    const { id, nombreCompleto } = usuarioAEliminar
    setIsDeleting(true)
    try {
      await usuarioService.remove(id)
      toast.success('Usuario eliminado', {
        description: `"${nombreCompleto}" fue eliminado correctamente.`,
      })
      setUsuarioAEliminar(null)
      reload()
    } catch {
      toast.error('No se pudo eliminar el usuario', {
        description: 'Inténtalo de nuevo en unos segundos.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 motion-safe:animate-rise">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-gray-500">
            Administración <span className="mx-2">›</span> Usuarios
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
              Usuarios
            </h1>
            {isLoading ? null : (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-dm-sans text-xs font-semibold text-primary-blue">
                {meta.total.toLocaleString('es-GT')} usuarios
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">Administra los usuarios del sistema.</p>
        </div>
        <Link
          to="/administracion/usuarios/crear"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue"
        >
          <Icon name="icon-plus" className="size-4" />
          Nuevo usuario
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-soft">
        <div className="border-b border-gray-200 p-4">
          <label className="flex h-10 items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-gray-400 transition-colors focus-within:border-primary-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-blue/15">
            <Icon name="icon-search" className="size-5 shrink-0" />
            <span className="sr-only">Buscar usuarios</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario…"
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        {error ? (
          <p role="alert" className="p-8 text-center text-sm font-medium text-error-red">
            {error}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-140 text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th scope="col" className="px-6 py-3.5">Nombre completo</th>
                  <th scope="col" className="px-6 py-3.5">Correo electrónico</th>
                  <th scope="col" className="px-6 py-3.5">Rol</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Cargando usuarios…</td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay usuarios para mostrar.</td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id} className="text-gray-600 transition-colors hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-sora text-xs font-semibold text-primary-blue">
                            {getInitials(usuario.nombreCompleto)}
                          </span>
                          <span className="font-semibold text-navy-950">{usuario.nombreCompleto}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{usuario.correoElectronico}</td>
                      <td className="whitespace-nowrap px-6 py-4">{usuario.rolAsignado}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/administracion/usuarios/${usuario.id}/editar`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-primary-blue transition-colors hover:border-primary-blue/40 hover:bg-blue-50"
                          >
                            <Icon name="icon-edit" className="size-4" />
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => setUsuarioAEliminar({ id: Number(usuario.id), nombreCompleto: usuario.nombreCompleto })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-error-red transition-colors hover:border-error-red/40 hover:bg-red-50"
                          >
                            <Icon name="icon-trash" className="size-4" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Mostrando {usuarios.length} de {meta.total.toLocaleString('es-GT')} usuarios
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="rounded-lg bg-navy-950 px-3 py-1.5 font-semibold tabular-nums text-white">{page}</span>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page >= meta.totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      <DeleteConfirmationModal
        open={Boolean(usuarioAEliminar)}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${usuarioAEliminar?.nombreCompleto}"?`}
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onCancel={() => setUsuarioAEliminar(null)}
      />
    </div>
  )
}

export default UsuariosPage
