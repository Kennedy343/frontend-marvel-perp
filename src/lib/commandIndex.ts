import { navigation } from './navigation'
import { tienePermiso, tieneRecurso } from './permisos'
import type { IconName } from '../components/common/Icon'

export interface PaletteCommand {
  id: string
  label: string
  path: string
  icon?: IconName
}

export type CommandGroup = 'navegacion' | 'acciones'

export interface Command extends PaletteCommand {
  group: CommandGroup
}

export interface MatchResult {
  indices: number[]
  score: number
}

const ACTION_ICONS: Record<string, IconName> = {
  crear: 'icon-plus',
  actualizar: 'icon-edit',
  leer: 'icon-eye',
}

const DEFAULT_ICON: IconName = 'icon-search'

function actionIcon(permiso: string | undefined, fallback?: IconName): IconName {
  if (permiso) {
    const accion = permiso.slice(0, permiso.indexOf(':'))
    const icon = ACTION_ICONS[accion]
    if (icon) return icon
  }
  return fallback ?? DEFAULT_ICON
}

export function buildCommands(permisos: string[] | undefined): Command[] {
  const commands: Command[] = []
  const seenPaths = new Set<string>()

  const push = (command: Command) => {
    if (seenPaths.has(command.path)) return
    seenPaths.add(command.path)
    commands.push(command)
  }

  for (const section of navigation) {
    for (const item of section.items) {
      if (!tieneRecurso(permisos, item.recurso)) continue

      push({
        id: item.key,
        label: item.label,
        path: item.path,
        icon: item.icon ?? DEFAULT_ICON,
        group: 'navegacion',
      })

      for (const child of item.children ?? []) {
        if (child.path === item.path) continue
        if (!tienePermiso(permisos, child.permiso)) continue
        push({
          id: child.key,
          label: child.label,
          path: child.path,
          icon: actionIcon(child.permiso, item.icon),
          group: child.permiso?.startsWith('crear:') ? 'acciones' : 'navegacion',
        })
      }
    }
  }

  return commands
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

// Fuzzy subsecuencia con puntaje por contigüidad/limite de palabra.
export function fuzzyMatch(query: string, target: string): MatchResult | null {
  const normalizedQuery = fold(query)
  if (!normalizedQuery) return { indices: [], score: 0 }

  const folded = Array.from(target, (char) => fold(char))
  const indices: number[] = []
  let targetIndex = 0
  let score = 0
  let streak = 0

  for (const char of normalizedQuery) {
    let found = -1
    while (targetIndex < folded.length) {
      if (folded[targetIndex] === char) {
        found = targetIndex
        break
      }
      targetIndex += 1
    }
    if (found === -1) return null

    indices.push(found)
    const previous = found > 0 ? folded[found - 1] : ''
    const isBoundary =
      found === 0 ||
      previous === ' ' ||
      previous === '/' ||
      previous === '-' ||
      previous === '_'
    streak = isBoundary ? 0 : streak + 1
    score += isBoundary ? 14 : 8 + streak * 2
    targetIndex = found + 1
  }

  score -= Math.min(target.length, 40) * 0.15
  return { indices, score }
}
