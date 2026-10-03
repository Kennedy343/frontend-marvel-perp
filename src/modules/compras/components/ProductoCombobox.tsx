import { useEffect, useRef, useState } from 'react'
import Icon from '../../../components/common/Icon'
import type { CompraProducto } from '../types/compra'

const MIN_SEARCH_LENGTH = 3

interface ProductoComboboxProps {
  productos: CompraProducto[]
  selectedProducto: CompraProducto | null
  onSelect: (producto: CompraProducto | null) => void
  onSearchChange: (value: string) => void
  onOpenCreate: (initialQuery?: string) => void
  isSearching?: boolean
  disabled?: boolean
  hasError?: boolean
  id?: string
}

function productoLabel(producto: CompraProducto): string {
  return `${producto.codigoProducto} — ${producto.nombreProducto}`
}

export default function ProductoCombobox({
  productos,
  selectedProducto,
  onSelect,
  onSearchChange,
  onOpenCreate,
  isSearching = false,
  disabled = false,
  hasError = false,
  id,
}: ProductoComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputValue =
    selectedProducto && !isOpen ? productoLabel(selectedProducto) : query

  const showSearchHint = query.trim().length < MIN_SEARCH_LENGTH
  const showEmptyState = !showSearchHint && !isSearching && productos.length === 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery(selectedProducto ? productoLabel(selectedProducto) : '')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedProducto])

  const handleSelect = (producto: CompraProducto) => {
    onSelect(producto)
    setQuery(productoLabel(producto))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(null)
    setQuery('')
    onSearchChange('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon name="icon-search" className="size-4" />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearchChange(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            if (selectedProducto) {
              setQuery('')
            }
          }}
          disabled={disabled}
          placeholder="Buscar por código o nombre…"
          className={`w-full rounded-lg border bg-white py-2.5 pr-16 pl-9 font-dm-sans text-sm text-navy-950 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            hasError
              ? 'border-error-red bg-red-50/20 focus-visible:outline-error-red'
              : 'border-gray-200 hover:border-gray-300 focus-visible:outline-primary-blue'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {selectedProducto && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
              title="Limpiar selección"
            >
              <Icon name="icon-close" className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (disabled) return
              if (isOpen) {
                setIsOpen(false)
                setQuery(selectedProducto ? productoLabel(selectedProducto) : '')
              } else {
                setIsOpen(true)
              }
            }}
            disabled={disabled}
            aria-label="Alternar lista de productos"
            className="rounded p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-primary-blue"
            tabIndex={-1}
          >
            <Icon name="icon-chevron-down" className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {showSearchHint ? (
            <p className="p-3 text-center font-dm-sans text-xs text-gray-500">
              Escriba al menos {MIN_SEARCH_LENGTH} caracteres para buscar…
            </p>
          ) : isSearching ? (
            <div className="flex items-center justify-center gap-2 p-3">
              <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
              <p className="font-dm-sans text-xs text-gray-500">Buscando…</p>
            </div>
          ) : showEmptyState ? (
            <div className="p-3 text-center">
              <p className="font-dm-sans text-xs text-gray-500">
                No se encontró ningún producto con &ldquo;<strong className="text-navy-950">{query}</strong>&rdquo;
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {productos.map((p) => {
                const isSelected = selectedProducto?.idProducto === p.idProducto
                return (
                  <button
                    key={p.idProducto}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-dm-sans text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-primary-blue font-semibold'
                        : 'text-navy-950 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-mono font-bold text-gray-700">{p.codigoProducto}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="truncate">{p.nombreProducto}</span>
                    </div>
                    {isSelected && <Icon name="icon-check" className="size-4 shrink-0 text-primary-blue" />}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-1 border-t border-gray-100 pt-1.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                onOpenCreate(query.includes('—') ? '' : query)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2 font-dm-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-100/70 focus-visible:outline-2 focus-visible:outline-primary-blue"
            >
              <Icon name="icon-plus" className="size-3.5" />
              <span>Crear nuevo producto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
