import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { clearDraft, readDraft, writeDraft } from '../lib/draftStorage'
import type { DraftRecord } from '../lib/draftStorage'

interface UseDraftStateOptions {
  ttlMs?: number
  debounceMs?: number
}

export interface DraftStateMeta {
  restoredAt: number | null
  discardDraft: () => void
}

export function useDraftState<T>(
  key: string | null,
  initialState: T,
  options: UseDraftStateOptions = {},
): [T, Dispatch<SetStateAction<T>>, DraftStateMeta] {
  const { ttlMs, debounceMs = 500 } = options

  // Capturar el estado inicial una sola vez, sin leer refs durante el render.
  const [initialSnapshot] = useState<T>(initialState)

  const [restored] = useState<DraftRecord<T> | null>(() =>
    key ? readDraft<T>(key, ttlMs) : null,
  )

  const [state, setState] = useState<T>(
    () => restored?.data ?? initialSnapshot,
  )
  const [restoredAt, setRestoredAt] = useState<number | null>(
    () => restored?.savedAt ?? null,
  )

  const initialSerialized = useMemo(
    () => JSON.stringify(initialSnapshot),
    [initialSnapshot],
  )

  const discardDraft = useCallback(() => {
    if (key) clearDraft(key)
    setState(initialSnapshot)
    setRestoredAt(null)
  }, [key, initialSnapshot])

  useEffect(() => {
    if (!key) return
    const timeout = window.setTimeout(() => {
      if (JSON.stringify(state) === initialSerialized) {
        clearDraft(key)
        return
      }
      writeDraft(key, state)
    }, debounceMs)
    return () => window.clearTimeout(timeout)
  }, [key, state, debounceMs, initialSerialized])

  const meta = useMemo<DraftStateMeta>(
    () => ({ restoredAt, discardDraft }),
    [restoredAt, discardDraft],
  )

  return [state, setState, meta]
}
