import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import Icon from './Icon'

export interface FilterOption<T extends string | number = number> {
  value: T
  label: string
}

interface InternalOption<T extends string | number> {
  value: T | null
  label: string
}

function getOptionLabel<T extends string | number>(option: InternalOption<T>): string {
  return option.label
}

function isSameOption<T extends string | number>(
  a: InternalOption<T>,
  b: InternalOption<T>,
): boolean {
  return a.value === b.value
}

interface FilterComboboxProps<T extends string | number = number> {
  items: FilterOption<T>[]
  value: T | undefined
  onChange: (value: T | undefined) => void
  ariaLabel: string
  allLabel?: string
  placeholder?: ReactNode
  emptyLabel?: string
  id?: string
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
  clearOnFocus?: boolean
  remoteSearch?: boolean
  onSearchChange?: (query: string) => void
  isSearching?: boolean
  minSearchLength?: number
  searchHint?: string
  searchingLabel?: string
  renderItemExtra?: (value: T) => ReactNode
  className?: string
}

function FilterCombobox<T extends string | number = number>({
  items,
  value,
  onChange,
  ariaLabel,
  allLabel,
  placeholder,
  emptyLabel = 'No se encontraron resultados.',
  id,
  disabled = false,
  invalid = false,
  searchable = false,
  clearOnFocus = false,
  remoteSearch = false,
  onSearchChange,
  isSearching = false,
  minSearchLength = 0,
  searchHint,
  searchingLabel = 'Buscando…',
  renderItemExtra,
  className,
}: FilterComboboxProps<T>) {
  const [query, setQuery] = useState('')

  const options = useMemo<InternalOption<T>[]>(
    () => [
      ...(allLabel ? [{ value: null, label: allLabel }] : []),
      ...items.map((item) => ({ value: item.value, label: item.label })),
    ],
    [allLabel, items],
  )

  const selected =
    options.find((option) => option.value === (value ?? null)) ?? null

  const showInput = searchable || remoteSearch
  const showSearchHint = remoteSearch && query.trim().length < minSearchLength

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => onChange(option?.value ?? undefined)}
      onInputValueChange={
        remoteSearch
          ? (next, details) => {
              setQuery(next)
              if (details.reason === 'input-change') onSearchChange?.(next)
            }
          : undefined
      }
      itemToStringLabel={getOptionLabel}
      isItemEqualToValue={isSameOption}
      filter={remoteSearch ? null : searchable ? undefined : null}
      disabled={disabled}
    >
      {showInput ? (
        <ComboboxInput
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          showClear
          placeholder={typeof placeholder === 'string' ? placeholder : undefined}
          onFocus={() => {
            if (clearOnFocus && value !== undefined) onChange(undefined)
          }}
          className={cn(
            className,
            invalid && 'border-error-red bg-red-50/30 text-error-red',
          )}
        />
      ) : (
        <ComboboxTrigger
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          className="[&_svg.text-muted-foreground]:hidden"
          render={
            <Button
              variant="outline"
              className={cn(
                'group w-full justify-between font-normal',
                className,
                invalid &&
                  'border-error-red bg-red-50/30 text-error-red focus-visible:border-error-red focus-visible:ring-2 focus-visible:ring-red-200',
              )}
            >
              <ComboboxValue placeholder={placeholder} />
              <Icon
                name="icon-chevron-down"
                className="size-4 shrink-0 text-gray-400 transition-transform duration-200 group-data-[popup-open]:rotate-180"
              />
            </Button>
          }
        />
      )}
      <ComboboxContent>
        {showSearchHint ? (
          <p className="p-3 text-center font-dm-sans text-xs text-gray-500">
            {searchHint}
          </p>
        ) : remoteSearch && isSearching ? (
          <div className="flex items-center justify-center gap-2 p-3">
            <div className="size-4 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
            <p className="font-dm-sans text-xs text-gray-500">{searchingLabel}</p>
          </div>
        ) : (
          <>
            <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
            <ComboboxList>
              {(option: InternalOption<T>) => (
                <ComboboxItem key={option.value ?? 'all'} value={option}>
                  {renderItemExtra && option.value != null ? (
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {renderItemExtra(option.value)}
                    </span>
                  ) : (
                    option.label
                  )}
                </ComboboxItem>
              )}
            </ComboboxList>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  )
}

export default FilterCombobox
