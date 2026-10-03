import { memo, useCallback, useMemo, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

export interface MultiSelectOption {
  value: number
  label: string
  description?: string
}

interface MultiSelectFieldProps {
  id?: string
  items: MultiSelectOption[]
  selectedIds: readonly number[]
  onChange: (ids: number[]) => void
  ariaLabel: string
  placeholder?: string
  emptyLabel?: string
  maxVisibleChips?: number
  disabled?: boolean
  invalid?: boolean
  className?: string
  portalContainer?: HTMLElement | RefObject<HTMLElement | null> | null
}

// Hoisted pure functions (Vercel: prefer-module-scope-pure-function).
function getOptionLabel(option: MultiSelectOption): string {
  return option.label
}

function isSameOption(a: MultiSelectOption, b: MultiSelectOption): boolean {
  return a.value === b.value
}

const MultiSelectField = memo(function MultiSelectField({
  id,
  items,
  selectedIds,
  onChange,
  ariaLabel,
  placeholder = 'Buscar…',
  emptyLabel = 'No se encontraron resultados.',
  maxVisibleChips = 4,
  disabled = false,
  invalid = false,
  className,
  portalContainer,
}: MultiSelectFieldProps) {
  // Índice O(1) para resolver las selecciones (Vercel: js-index-maps, js-set-map-lookups).
  const optionByValue = useMemo(
    () => new Map(items.map((item) => [item.value, item])),
    [items],
  )

  const selectedItems = useMemo(
    () =>
      selectedIds.flatMap((idSeleccionado) => {
        const item = optionByValue.get(idSeleccionado)
        return item ? [item] : []
      }),
    [selectedIds, optionByValue],
  )

  const visibleItems = selectedItems.slice(0, maxVisibleChips)
  const hiddenCount = selectedItems.length - visibleItems.length

  const handleValueChange = useCallback(
    (next: MultiSelectOption[]) => {
      onChange(next.map((item) => item.value))
    },
    [onChange],
  )

  return (
    <Combobox
      multiple
      items={items}
      value={selectedItems}
      onValueChange={handleValueChange}
      itemToStringLabel={getOptionLabel}
      isItemEqualToValue={isSameOption}
      disabled={disabled}
    >
      <ComboboxChips
        className={cn(
          'min-h-11 flex-wrap gap-1.5 rounded-lg border bg-white px-2.5 py-2 transition-colors focus-within:ring-2',
          invalid
            ? 'border-error-red focus-within:border-error-red focus-within:ring-error-red/20'
            : 'border-gray-200 focus-within:border-primary-blue focus-within:ring-primary-blue/15',
          disabled && 'cursor-not-allowed bg-gray-50',
          className,
        )}
      >
        {visibleItems.map((item) => (
          <ComboboxChip
            key={item.value}
            className="gap-1 rounded-md bg-blue-50 px-2 py-1 font-dm-sans text-xs font-medium text-primary-blue"
          >
            {item.label}
          </ComboboxChip>
        ))}
        {hiddenCount > 0 ? (
          <span className="rounded-md bg-gray-100 px-2 py-1 font-dm-sans text-xs font-medium text-gray-600">
            +{hiddenCount} más
          </span>
        ) : null}
        <ComboboxChipsInput
          id={id}
          aria-label={ariaLabel}
          aria-invalid={invalid}
          disabled={disabled}
          placeholder={selectedItems.length === 0 ? placeholder : ''}
          className="h-7 min-w-24 flex-1 font-dm-sans text-sm text-gray-900 placeholder:text-gray-400"
        />
      </ComboboxChips>
      <ComboboxContent container={portalContainer}>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(option: MultiSelectOption) => (
            <ComboboxItem key={option.value} value={option}>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{option.label}</span>
                {option.description ? (
                  <span className="block truncate text-xs text-gray-500">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
})

export default MultiSelectField
