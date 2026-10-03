import { memo, useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import Icon from '../../../components/common/Icon'
import type { PermisoModulo } from '../types/usuario'
import { ACCIONES_POR_RECURSO, PERMISO_GRUPOS } from './permisoGrupos'
import type { PermisoGrupo } from './permisoGrupos'

interface PermisosCardProps {
  modulos: PermisoModulo[]
  selectedPermisos: Set<number>
  onTogglePermiso: (idPermiso: number) => void
  onToggleAllInModulo: (acciones: PermisoAccion[]) => void
  disabled?: boolean
}

interface PermisoAccion {
  accion: string
  idPermiso: number
}

interface RecursoPresente {
  recurso: string
  acciones: PermisoAccion[]
}

// Orden canónico de columnas. `as const` mantiene los literales de `key`/`icon`.
const ACTIONS = [
  { key: 'leer', icon: 'icon-eye', label: 'Ver' },
  { key: 'crear', icon: 'icon-plus-circle', label: 'Crear' },
  { key: 'actualizar', icon: 'icon-edit', label: 'Editar' },
  { key: 'eliminar', icon: 'icon-trash', label: 'Eliminar' },
  { key: 'gestionar', icon: 'icon-download', label: 'Gestionar' },
  { key: 'aprobar', icon: 'icon-check', label: 'Aprobar' },
] as const

type ActionDef = (typeof ACTIONS)[number]

const MODULE_ICONS = {
  inventarios: 'icon-inventory',
  ventas: 'icon-sales',
} as const

// Índice O(1) de acciones habilitadas (Vercel Best Practice: js-set-map-lookups).
const ACCIONES_HABILITADAS = new Map<string, ReadonlySet<string>>(
  Object.entries(ACCIONES_POR_RECURSO).map(([recurso, acciones]) => [recurso, new Set(acciones)]),
)

function filtrarAcciones(recurso: string, acciones: PermisoAccion[]): PermisoAccion[] {
  const permitidas = ACCIONES_HABILITADAS.get(recurso)
  return permitidas ? acciones.filter((accion) => permitidas.has(accion.accion)) : acciones
}

function isAllSelected(acciones: PermisoAccion[], selected: Set<number>): boolean {
  return acciones.length > 0 && acciones.every((accion) => selected.has(accion.idPermiso))
}

function hasAnySelected(acciones: PermisoAccion[], selected: Set<number>): boolean {
  return acciones.some((accion) => selected.has(accion.idPermiso))
}

function gridStyle(columnas: number): CSSProperties {
  return { gridTemplateColumns: `minmax(0, 1fr) repeat(${columnas}, 2.5rem)` }
}

function TriStateCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate: boolean
  disabled: boolean
  onChange: () => void
  label: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={label}
      className="size-5 accent-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
    />
  )
}

const AccionesHeader = memo(function AccionesHeader({
  acciones,
  label,
  compact,
  className,
}: {
  acciones: readonly ActionDef[]
  label: string
  compact: boolean
  className: string
}) {
  return (
    <div className={className} style={gridStyle(acciones.length)}>
      <span>{label}</span>
      {acciones.map((action) => (
        <span
          key={action.key}
          className="flex justify-center"
          title={action.label}
          aria-label={action.label}
        >
          <Icon name={action.icon} className={compact ? 'size-4 text-gray-500' : 'size-5'} />
        </span>
      ))}
    </div>
  )
})

const GrupoCard = memo(function GrupoCard({
  grupo,
  recursosPresentes,
  selectedPermisos,
  onTogglePermiso,
  onToggleAllInModulo,
  disabled,
}: {
  grupo: PermisoGrupo
  recursosPresentes: RecursoPresente[]
  selectedPermisos: Set<number>
  onTogglePermiso: (idPermiso: number) => void
  onToggleAllInModulo: (acciones: PermisoAccion[]) => void
  disabled: boolean
}) {
  const esColapsado = Boolean(grupo.colapsado)

  // Índices y columnas visibles en un solo recorrido (Vercel: js-combine-iterations, js-index-maps).
  const { accionesVisibles, filas, todasLasAcciones, accionesByAccion } = useMemo(() => {
    const presentes = new Set<string>()
    const todasLasAcciones: PermisoAccion[] = []
    const accionesByAccion = new Map<string, PermisoAccion[]>()
    const filas: { recurso: string; accionToId: Map<string, number> }[] = []

    for (const { recurso, acciones } of recursosPresentes) {
      const visibles = filtrarAcciones(recurso, acciones)
      const accionToId = new Map<string, number>()

      for (const accion of visibles) {
        accionToId.set(accion.accion, accion.idPermiso)
        presentes.add(accion.accion)
        todasLasAcciones.push(accion)

        const acumuladas = accionesByAccion.get(accion.accion)
        if (acumuladas) {
          acumuladas.push(accion)
        } else {
          accionesByAccion.set(accion.accion, [accion])
        }
      }

      filas.push({ recurso, accionToId })
    }

    return {
      accionesVisibles: ACTIONS.filter((action) => presentes.has(action.key)),
      filas,
      todasLasAcciones,
      accionesByAccion,
    }
  }, [recursosPresentes])

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
      <header
        className={`flex items-center justify-between border-b border-gray-200 bg-indigo-50/60 ${
          esColapsado ? 'px-5 py-4' : 'px-6 py-5'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-slate-600">
            <Icon name={grupo.icono} className="size-5" />
          </span>
          <div>
            <h2 className="font-sora text-lg font-medium capitalize text-navy-950 sm:text-xl">
              {grupo.titulo}
            </h2>
            {esColapsado ? null : (
              <p className="text-xs text-gray-500">
                {recursosPresentes.map((recurso) => recurso.recurso).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-950">
          Seleccionar Todo
          <TriStateCheckbox
            checked={isAllSelected(todasLasAcciones, selectedPermisos)}
            indeterminate={
              hasAnySelected(todasLasAcciones, selectedPermisos) &&
              !isAllSelected(todasLasAcciones, selectedPermisos)
            }
            disabled={disabled || todasLasAcciones.length === 0}
            onChange={() => onToggleAllInModulo(todasLasAcciones)}
            label={`Seleccionar todo ${grupo.titulo}`}
          />
        </label>
      </header>

      {esColapsado ? (
        <div>
          <AccionesHeader
            acciones={accionesVisibles}
            label="Acciones"
            compact
            className="grid items-center border-b border-gray-200 bg-gray-50/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-950"
          />
          <div
            className="grid items-center px-5 py-3.5 text-sm font-medium text-navy-950"
            style={gridStyle(accionesVisibles.length)}
          >
            <span>{grupo.titulo}</span>
            {accionesVisibles.map((action) => {
              const acciones = accionesByAccion.get(action.key) ?? []
              if (acciones.length === 0) {
                return <span key={action.key} className="flex justify-center" aria-hidden="true" />
              }
              return (
                <span key={action.key} className="flex justify-center">
                  <TriStateCheckbox
                    checked={isAllSelected(acciones, selectedPermisos)}
                    indeterminate={
                      hasAnySelected(acciones, selectedPermisos) &&
                      !isAllSelected(acciones, selectedPermisos)
                    }
                    disabled={disabled}
                    onChange={() => onToggleAllInModulo(acciones)}
                    label={`${action.label} en todo el grupo ${grupo.titulo}`}
                  />
                </span>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <AccionesHeader
            acciones={accionesVisibles}
            label="Sub-módulo"
            compact={false}
            className="grid items-center border-b border-gray-300 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-navy-950"
          />
          <div className="divide-y divide-gray-200">
            {filas.map(({ recurso, accionToId }) => (
              <div
                key={recurso}
                className="grid items-center px-6 py-4 text-sm text-navy-950"
                style={gridStyle(accionesVisibles.length)}
              >
                <span className="capitalize">{recurso}</span>
                {accionesVisibles.map((action) => {
                  const idPermiso = accionToId.get(action.key)
                  return (
                    <span key={action.key} className="flex justify-center">
                      {idPermiso === undefined ? null : (
                        <input
                          type="checkbox"
                          aria-label={`${action.label} ${recurso}`}
                          checked={selectedPermisos.has(idPermiso)}
                          onChange={() => onTogglePermiso(idPermiso)}
                          disabled={disabled}
                          className="size-5 accent-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      )}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  )
})

const ModuloCard = memo(function ModuloCard({
  recurso,
  acciones,
  selectedPermisos,
  onTogglePermiso,
  onToggleAllInModulo,
  disabled,
}: {
  recurso: string
  acciones: PermisoAccion[]
  selectedPermisos: Set<number>
  onTogglePermiso: (idPermiso: number) => void
  onToggleAllInModulo: (acciones: PermisoAccion[]) => void
  disabled: boolean
}) {
  const { accionesVisibles, accionToId, visibles } = useMemo(() => {
    const visibles = filtrarAcciones(recurso, acciones)
    const accionToId = new Map<string, number>()
    const presentes = new Set<string>()

    for (const accion of visibles) {
      accionToId.set(accion.accion, accion.idPermiso)
      presentes.add(accion.accion)
    }

    return {
      accionesVisibles: ACTIONS.filter((action) => presentes.has(action.key)),
      accionToId,
      visibles,
    }
  }, [recurso, acciones])

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-gray-200 bg-indigo-50/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-slate-600">
            <Icon
              name={MODULE_ICONS[recurso as keyof typeof MODULE_ICONS] ?? 'icon-settings'}
              className="size-5"
            />
          </span>
          <h2 className="font-sora text-lg font-medium capitalize text-navy-950 sm:text-xl">
            {recurso}
          </h2>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-950">
          Seleccionar Todo
          <input
            type="checkbox"
            checked={isAllSelected(visibles, selectedPermisos)}
            onChange={() => onToggleAllInModulo(visibles)}
            disabled={disabled || visibles.length === 0}
            className="size-5 accent-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </header>

      <div>
        <AccionesHeader
          acciones={accionesVisibles}
          label="Acciones"
          compact
          className="grid items-center border-b border-gray-200 bg-gray-50/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-navy-950"
        />
        <div
          className="grid items-center px-5 py-3.5 text-sm font-medium text-navy-950"
          style={gridStyle(accionesVisibles.length)}
        >
          <span className="capitalize">{recurso}</span>
          {accionesVisibles.map((action) => {
            const idPermiso = accionToId.get(action.key)
            return (
              <span key={action.key} className="flex justify-center">
                {idPermiso === undefined ? null : (
                  <input
                    type="checkbox"
                    aria-label={`${action.label} ${recurso}`}
                    checked={selectedPermisos.has(idPermiso)}
                    onChange={() => onTogglePermiso(idPermiso)}
                    disabled={disabled}
                    className="size-5 accent-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
                  />
                )}
              </span>
            )
          })}
        </div>
      </div>
    </article>
  )
})

function PermisosCard({
  modulos,
  selectedPermisos,
  onTogglePermiso,
  onToggleAllInModulo,
  disabled = false,
}: PermisosCardProps) {
  const { gruposRender, modulosSueltos } = useMemo(() => {
    const recursoMap = new Map(modulos.map((modulo) => [modulo.recurso, modulo.acciones]))
    const recursosAgrupados = new Set(PERMISO_GRUPOS.flatMap((grupo) => grupo.recursos))

    const grupos = PERMISO_GRUPOS.flatMap((grupo) => {
      const recursosPresentes = grupo.recursos.flatMap((recurso) => {
        const acciones = recursoMap.get(recurso)
        return acciones ? [{ recurso, acciones }] : []
      })
      return recursosPresentes.length > 0 ? [{ grupo, recursosPresentes }] : []
    })

    const sueltos = modulos.filter((modulo) => !recursosAgrupados.has(modulo.recurso))

    return { gruposRender: grupos, modulosSueltos: sueltos }
  }, [modulos])

  if (modulos.length === 0) {
    return (
      <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft sm:p-7">
        <p className="text-center text-sm text-gray-500">No hay módulos disponibles.</p>
      </article>
    )
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {gruposRender.map(({ grupo, recursosPresentes }) => (
        <GrupoCard
          key={grupo.key}
          grupo={grupo}
          recursosPresentes={recursosPresentes}
          selectedPermisos={selectedPermisos}
          onTogglePermiso={onTogglePermiso}
          onToggleAllInModulo={onToggleAllInModulo}
          disabled={disabled}
        />
      ))}
      {modulosSueltos.map((modulo) => (
        <ModuloCard
          key={modulo.recurso}
          recurso={modulo.recurso}
          acciones={modulo.acciones}
          selectedPermisos={selectedPermisos}
          onTogglePermiso={onTogglePermiso}
          onToggleAllInModulo={onToggleAllInModulo}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

export default PermisosCard
