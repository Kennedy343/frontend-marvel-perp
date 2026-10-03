import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useAuthStore } from '../../store/authStore'
import {
  buildCommands,
  fuzzyMatch,
  type Command,
  type CommandGroup,
  type PaletteCommand,
} from '../../lib/commandIndex'
import { getRecentCommands, pushRecentCommand } from '../../lib/recentCommands'
import type { RecentCommand } from '../../lib/recentCommands'

type GroupId = 'recientes' | CommandGroup

interface PaletteItem {
  command: PaletteCommand
  indices: number[]
  index: number
}

interface PaletteSection {
  id: GroupId
  label: string
  items: PaletteItem[]
}

interface HighlightedTextProps {
  text: string
  indices: number[]
}

function HighlightedText({ text, indices }: HighlightedTextProps) {
  if (indices.length === 0) return <>{text}</>
  const matchSet = new Set(indices)
  return (
    <>
      {Array.from(text).map((char, position) =>
        matchSet.has(position) ? (
          <span key={position} className="font-semibold text-primary-blue">
            {char}
          </span>
        ) : (
          <span key={position}>{char}</span>
        ),
      )}
    </>
  )
}

interface PaletteResultItemProps {
  item: PaletteItem
  isActive: boolean
  onHover: (index: number) => void
  onSelect: (command: PaletteCommand) => void
}

const PaletteResultItem = memo(function PaletteResultItem({
  item,
  isActive,
  onHover,
  onSelect,
}: PaletteResultItemProps) {
  const { command } = item
  return (
    <button
      type="button"
      role="option"
      id={`cmd-opt-${item.index}`}
      aria-selected={isActive}
      tabIndex={-1}
      onMouseEnter={() => onHover(item.index)}
      onClick={() => onSelect(command)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-dm-sans text-sm transition-colors ${
        isActive ? 'bg-blue-50 text-navy-950' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
          isActive ? 'bg-primary-blue text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Icon name={command.icon ?? 'icon-search'} className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">
        <HighlightedText text={command.label} indices={item.indices} />
      </span>
      <Icon
        name="icon-chevron-right"
        className={`size-4 shrink-0 ${isActive ? 'text-primary-blue' : 'text-gray-300'}`}
      />
    </button>
  )
})

interface CommandPaletteProps {
  onClose: () => void
}

function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recents] = useState<RecentCommand[]>(() => getRecentCommands(user?.id))
  const deferredQuery = useDeferredValue(query)

  const commands = useMemo(() => buildCommands(user?.permisos), [user?.permisos])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  const { sections, flatItems } = useMemo(() => {
    const term = deferredQuery.trim()
    const result: PaletteSection[] = []
    const flat: PaletteItem[] = []

    const addSection = (
      id: GroupId,
      label: string,
      source: Array<{ command: PaletteCommand; indices: number[] }>,
    ) => {
      if (source.length === 0) return
      const items = source.map(({ command, indices }) => {
        const item: PaletteItem = { command, indices, index: flat.length }
        flat.push(item)
        return item
      })
      result.push({ id, label, items })
    }

    if (!term) {
      addSection(
        'recientes',
        'Recientes',
        recents.map((command) => ({ command, indices: [] })),
      )
      return { sections: result, flatItems: flat }
    }

    const scored: Array<{ command: Command; indices: number[]; score: number }> = []
    for (const command of commands) {
      const match = fuzzyMatch(term, command.label)
      if (match) scored.push({ command, indices: match.indices, score: match.score })
    }
    scored.sort((a, b) => b.score - a.score)

    const navegacion: Array<{ command: PaletteCommand; indices: number[] }> = []
    const acciones: Array<{ command: PaletteCommand; indices: number[] }> = []
    for (const entry of scored) {
      const target = entry.command.group === 'acciones' ? acciones : navegacion
      target.push({ command: entry.command, indices: entry.indices })
    }

    addSection('navegacion', 'Navegación', navegacion)
    addSection('acciones', 'Acciones', acciones)
    return { sections: result, flatItems: flat }
  }, [deferredQuery, commands, recents])

  const safeActive = flatItems.length > 0 ? Math.min(activeIndex, flatItems.length - 1) : -1

  useEffect(() => {
    if (safeActive < 0) return
    document.getElementById(`cmd-opt-${safeActive}`)?.scrollIntoView({ block: 'nearest' })
  }, [safeActive])

  const handleSelect = useCallback(
    (command: PaletteCommand) => {
      pushRecentCommand(user?.id, command)
      onClose()
      navigate(command.path)
    },
    [user?.id, onClose, navigate],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (flatItems.length === 0) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % flatItems.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const item = flatItems[safeActive]
        if (item) handleSelect(item.command)
      }
    },
    [flatItems, safeActive, handleSelect],
  )

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    setActiveIndex(0)
  }, [])

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) onClose()
    },
    [onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
      aria-label="Buscador de comandos"
      className="fixed inset-0 m-auto max-h-[90vh] w-[min(92vw,40rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-card backdrop:bg-navy-950/40 backdrop:backdrop-blur-sm motion-safe:animate-rise"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
        <Icon name="icon-search" className="size-5 shrink-0 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar páginas y acciones…"
          aria-label="Buscar páginas y acciones"
          aria-controls="command-results"
          aria-activedescendant={safeActive >= 0 ? `cmd-opt-${safeActive}` : undefined}
          role="combobox"
          aria-expanded="true"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent font-dm-sans text-sm text-navy-950 outline-none placeholder:text-gray-400"
        />
        <Kbd>Esc</Kbd>
      </div>

      <div id="command-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
        {flatItems.length === 0 ? (
          <p className="px-3 py-10 text-center font-dm-sans text-sm text-gray-400">
            {deferredQuery.trim()
              ? 'Sin resultados para tu búsqueda.'
              : 'Escribe para buscar páginas y acciones.'}
          </p>
        ) : (
          sections.map((section) => (
            <div key={section.id} role="group" aria-label={section.label} className="mb-1 last:mb-0">
              <p className="px-3 py-1.5 font-dm-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>
              {section.items.map((item) => (
                <PaletteResultItem
                  key={`${section.id}-${item.command.id}`}
                  item={item}
                  isActive={item.index === safeActive}
                  onHover={setActiveIndex}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 font-dm-sans text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <KbdGroup>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
          </KbdGroup>
          navegar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↵</Kbd> abrir
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Esc</Kbd> cerrar
        </span>
      </div>
    </dialog>
  )
}

export default CommandPalette
