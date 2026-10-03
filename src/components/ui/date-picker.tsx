import { Suspense, lazy, memo, useCallback, useState } from "react"
import { CalendarIcon, XIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"
import { cn } from "cn"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Lazy-load the calendar + date-fns locale only when the picker is opened
// (Vercel Best Practice: bundle-dynamic-imports / bundle-conditional)
const DatePickerCalendar = lazy(() => import("./date-picker-calendar"))

function preloadCalendar() {
  void import("./date-picker-calendar")
}

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const displayFormatter = new Intl.DateTimeFormat("es-GT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  const match = DATE_ONLY_RE.exec(value)
  if (!match) return undefined
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateLabel(value?: string): string {
  const date = parseDateOnly(value)
  return date ? displayFormatter.format(date) : ""
}

interface DatePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  min?: string
  max?: string
  "aria-label"?: string
  className?: string
}

const DEFAULT_PLACEHOLDER = "Seleccione una fecha"

export const DatePicker = memo(function DatePicker({
  id,
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  clearable = false,
  min,
  max,
  "aria-label": ariaLabel,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = parseDateOnly(value)

  const disabledDays: Matcher[] = []
  const minDate = parseDateOnly(min)
  const maxDate = parseDateOnly(max)
  if (minDate) disabledDays.push({ before: minDate })
  if (maxDate) disabledDays.push({ after: maxDate })

  const showClear = clearable && Boolean(value) && !disabled

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return
      onChange(formatDateOnly(date))
      setOpen(false)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    onChange("")
  }, [onChange])

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          onPointerEnter={preloadCalendar}
          onFocus={preloadCalendar}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-left font-dm-sans text-sm transition-colors focus:border-primary-blue focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            selected ? "text-navy-950" : "text-gray-400",
            showClear && "pr-9",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-gray-400" />
          <span className="truncate">
            {selected ? formatDateLabel(value) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          {open && (
            <Suspense
              fallback={
                <div className="h-84 w-70 animate-pulse rounded-3xl bg-muted" />
              }
            >
              <DatePickerCalendar
                selected={selected}
                onSelect={handleSelect}
                disabled={disabledDays}
              />
            </Suspense>
          )}
        </PopoverContent>
      </Popover>

      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar fecha"
          className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-navy-950"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  )
})
