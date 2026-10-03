import { es } from "date-fns/locale"
import type { Matcher } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerCalendarProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  disabled: Matcher[]
}

export default function DatePickerCalendar({
  selected,
  onSelect,
  disabled,
}: DatePickerCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      locale={es}
      autoFocus
    />
  )
}
