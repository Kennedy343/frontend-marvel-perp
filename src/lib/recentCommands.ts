import type { PaletteCommand } from './commandIndex'

const STORAGE_KEY = 'marvel:recent-cmd:v1'
const MAX_RECENTS = 6

export interface RecentCommand extends PaletteCommand {
  at: number
}

function storageKey(userId?: number | string): string {
  return userId != null ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
}

function isValidCommand(value: unknown): value is RecentCommand {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.label === 'string' &&
    typeof record.path === 'string'
  )
}

export function getRecentCommands(userId?: number | string): RecentCommand[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidCommand).slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function pushRecentCommand(
  userId: number | string | undefined,
  command: PaletteCommand,
): void {
  if (typeof window === 'undefined') return
  const next: RecentCommand[] = [
    { ...command, at: Date.now() },
    ...getRecentCommands(userId).filter((item) => item.path !== command.path),
  ].slice(0, MAX_RECENTS)
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(next))
  } catch {
    // storage no disponible: el palette sigue funcionando sin recientes.
  }
}
