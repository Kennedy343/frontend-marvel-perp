import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Icon from '../../components/common/Icon'
import type { UserSucursal } from '../../types/user'

interface SucursalGateProps {
  sucursales: UserSucursal[]
  userName: string
  onSelect: (sucursal: UserSucursal) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U'
}

function SucursalGate({ sucursales, userName, onSelect }: SucursalGateProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = useMemo(
    () => sucursales.find((s) => s.idSucursal === selectedId) ?? null,
    [sucursales, selectedId],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const blockCancel = (event: Event) => event.preventDefault()
    dialog.addEventListener('cancel', blockCancel)
    return () => dialog.removeEventListener('cancel', blockCancel)
  }, [])

  const moveSelection = (direction: 1 | -1) => {
    if (sucursales.length === 0) return
    const currentIndex = sucursales.findIndex((s) => s.idSucursal === selectedId)
    const base = currentIndex === -1 ? (direction === 1 ? -1 : sucursales.length) : currentIndex
    const nextIndex = (base + direction + sucursales.length) % sucursales.length
    setSelectedId(sucursales[nextIndex].idSucursal)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveSelection(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveSelection(-1)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="sucursal-gate-title"
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-white p-0 backdrop:bg-navy-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="grid h-dvh grid-cols-1 lg:grid-cols-[minmax(300px,36%)_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-10 text-white lg:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-blue/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-primary-blue/10 blur-3xl"
          />

          <div className="relative">
            <p className="font-sora text-lg font-semibold tracking-tight">
              MARVEL<span className="text-primary-blue-light">.</span>
            </p>
          </div>

          <div className="relative">
            <span className="flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-primary-blue-light">
              <Icon name="icon-map-pin" className="size-5" />
            </span>
            <p className="mt-5 font-sora text-2xl font-semibold leading-snug">
              Tu jornada empieza en una sucursal.
            </p>
            <p className="mt-3 max-w-xs font-dm-sans text-sm leading-relaxed text-white/60">
              Elige dónde vas a operar hoy. Todo el sistema se enfocará en esa sucursal.
            </p>
          </div>

          <div className="relative flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-blue font-sora text-xs font-semibold text-white">
              {getInitials(userName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-dm-sans text-sm font-semibold text-white">{userName}</p>
              <p className="font-dm-sans text-xs text-white/50">Sesión iniciada</p>
            </div>
          </div>
        </aside>

        <section className="flex h-dvh flex-col overflow-y-auto bg-white px-6 py-10 motion-safe:animate-rise sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-primary-blue">
              Selección de sucursal
            </p>
            <h1
              id="sucursal-gate-title"
              className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl"
            >
              ¿En qué sucursal vas a trabajar?
            </h1>
            <p className="mt-2 font-dm-sans text-sm text-gray-500">
              Elige una sucursal para ver solo su información. Para cambiarla, cierra sesión y
              vuelve a iniciarla.
            </p>

            <div className="relative mt-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 left-8 top-5 w-px bg-gray-200"
              />
              <div
                role="listbox"
                aria-label="Sucursales disponibles"
                onKeyDown={handleKeyDown}
                className="relative space-y-2.5"
              >
                {sucursales.map((sucursal) => {
                  const isSelected = sucursal.idSucursal === selectedId
                  return (
                    <button
                      key={sucursal.idSucursal}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => setSelectedId(sucursal.idSucursal)}
                      className={`group relative flex w-full items-center gap-4 rounded-xl border py-3.5 pl-3.5 pr-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue ${
                        isSelected
                          ? 'border-primary-blue bg-blue-50/70'
                          : 'border-gray-200 bg-white hover:border-primary-blue/40 hover:bg-blue-50/40'
                      }`}
                    >
                      <span
                        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? 'border-primary-blue bg-primary-blue text-white'
                            : 'border-gray-200 bg-white text-gray-400 group-hover:text-primary-blue'
                        }`}
                      >
                        <Icon name="icon-map-pin" className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-sora text-sm font-semibold text-navy-950">
                          {sucursal.nombreSucursal}
                        </span>
                      </span>
                      <Icon
                        name="icon-chevron-right"
                        className={`size-4 shrink-0 transition-all ${
                          isSelected
                            ? 'text-primary-blue'
                            : 'text-gray-300 group-hover:translate-x-0.5 group-hover:text-primary-blue'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={!selected}
                onClick={() => selected && onSelect(selected)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-950 px-5 py-3 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy-950/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selected ? `Trabajar en ${selected.nombreSucursal}` : 'Elige una sucursal'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </dialog>
  )
}

export default SucursalGate
