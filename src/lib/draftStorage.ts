const DRAFT_PREFIX = 'marvel:draft:'
const DRAFT_VERSION = 1
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

// localStorage es sincrónico y costoso: cacheamos las lecturas en memoria.
const rawCache = new Map<string, string | null>()

interface StoredDraft<T> {
  version: number
  savedAt: number
  data: T
}

export interface DraftRecord<T> {
  data: T
  savedAt: number
}

function readRaw(key: string): string | null {
  if (!rawCache.has(key)) {
    rawCache.set(key, window.localStorage.getItem(key))
  }
  return rawCache.get(key) ?? null
}

function writeRaw(key: string, value: string): void {
  window.localStorage.setItem(key, value)
  rawCache.set(key, value)
}

function removeRaw(key: string): void {
  window.localStorage.removeItem(key)
  rawCache.delete(key)
}

if (typeof window !== 'undefined') {
  // Otra pestaña modificó el storage: invalidar la caché para no servir datos viejos.
  window.addEventListener('storage', (event) => {
    if (event.key) rawCache.delete(event.key)
    else rawCache.clear()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') rawCache.clear()
  })
}

export function buildDraftKey(
  userId: number | string,
  module: string,
  slice?: string,
): string {
  const base = `${DRAFT_PREFIX}${userId}:${module}`
  return slice ? `${base}:${slice}` : base
}

export function readDraft<T>(
  key: string,
  ttlMs: number = DEFAULT_TTL_MS,
): DraftRecord<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = readRaw(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft<T>
    if (
      !parsed ||
      parsed.version !== DRAFT_VERSION ||
      typeof parsed.savedAt !== 'number'
    ) {
      removeRaw(key)
      return null
    }
    if (Date.now() - parsed.savedAt > ttlMs) {
      removeRaw(key)
      return null
    }
    return { data: parsed.data, savedAt: parsed.savedAt }
  } catch {
    // JSON corrupto o storage no disponible: descartar sin romper la UI.
    return null
  }
}

export function writeDraft<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    const record: StoredDraft<T> = {
      version: DRAFT_VERSION,
      savedAt: Date.now(),
      data,
    }
    writeRaw(key, JSON.stringify(record))
  } catch {
    // Cuota llena o modo privado: ignorar, el formulario sigue funcionando.
  }
}

export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return
  try {
    removeRaw(key)
  } catch {
    // noop
  }
}

export function clearDraftsForUser(userId: number | string): void {
  if (typeof window === 'undefined') return
  const prefix = `${DRAFT_PREFIX}${userId}:`
  try {
    // Iterar hacia atrás para poder eliminar sin desplazar los índices pendientes.
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(prefix)) removeRaw(key)
    }
  } catch {
    // noop
  }
}
