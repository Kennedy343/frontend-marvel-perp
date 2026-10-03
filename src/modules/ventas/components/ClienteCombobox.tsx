import { memo, useEffect, useRef, useState } from 'react'
import Icon from '../../../components/common/Icon'
import type { Client } from '../../crm/types/client'

interface ClienteComboboxProps {
  clientes: Client[]
  selectedId: string
  searchTerm: string
  onSearchChange: (value: string) => void
  onSelect: (idCliente: string) => void
  onOpenCreate: () => void
  isLoading?: boolean
  hasError?: boolean
  disabled?: boolean
}

function formatClienteName(c: Client): string {
  const partes = [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
  return partes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

function ClienteComboboxBase({
  clientes,
  selectedId,
  searchTerm,
  onSearchChange,
  onSelect,
  onOpenCreate,
  isLoading = false,
  hasError = false,
  disabled = false,
}: ClienteComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchable = searchTerm.trim().length >= 2
  const showEmptyState = !searchable

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon name="icon-search" className="size-4" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
          }}
          disabled={disabled}
          placeholder="Buscar por nombre, DPI o NIT…"
          aria-busy={isLoading}
          className={`w-full rounded-lg border bg-white py-2.5 pl-9 font-dm-sans text-sm text-navy-950 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            isLoading ? 'pr-9' : 'pr-4'
          } ${
            hasError
              ? 'border-error-red bg-red-50/20 focus-visible:outline-error-red'
              : 'border-gray-200 hover:border-gray-300 focus-visible:outline-primary-blue'
          }`}
        />
        {isLoading && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          </span>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          aria-busy={isLoading}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
        >
          {showEmptyState ? (
            <div className="p-3 text-center">
              <p className="font-dm-sans text-xs text-gray-500">
                Escriba al menos 2 caracteres para buscar clientes.
              </p>
            </div>
          ) : clientes.length > 0 ? (
            <div className="space-y-0.5">
              {clientes.map((c) => {
                const isSelected = String(c.idCliente) === selectedId
                return (
                  <button
                    key={c.idCliente}
                    type="button"
                    onClick={() => {
                      onSelect(String(c.idCliente))
                      setIsOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-dm-sans text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-primary-blue font-semibold'
                        : 'text-navy-950 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="truncate">{formatClienteName(c)}</span>
                      <span className="ml-2 text-gray-400">
                        {c.dpiCliente ? `DPI: ${c.dpiCliente}` : c.nit ? `NIT: ${c.nit}` : ''}
                      </span>
                    </div>
                    {isSelected && <Icon name="icon-check" className="size-4 shrink-0 text-primary-blue" />}
                  </button>
                )
              })}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 p-3">
              <span className="size-3.5 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
              <p className="font-dm-sans text-xs text-gray-500">Buscando clientes…</p>
            </div>
          ) : (
            <div className="p-3 text-center">
              <p className="font-dm-sans text-xs text-gray-500">
                No se encontró ningún cliente con &ldquo;
                <strong className="text-navy-950">{searchTerm}</strong>&rdquo;
              </p>
            </div>
          )}

          <div className="mt-1 border-t border-gray-100 pt-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onOpenCreate()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-100/70 focus-visible:outline-2 focus-visible:outline-primary-blue"
            >
              <Icon name="icon-plus" className="size-3.5" />
              <span>Crear nuevo cliente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const ClienteCombobox = memo(ClienteComboboxBase)