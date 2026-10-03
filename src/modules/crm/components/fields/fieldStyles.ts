const inputBase =
  'w-full rounded-lg border bg-white font-dm-sans text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50'

const inputPadding = 'px-3.5 py-2.5'
const inputPaddingWithIcon = 'py-2.5 pr-3.5 pl-10'

export function fieldClass(hasError: boolean, withIcon = false): string {
  const state = hasError
    ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
    : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
  return `${inputBase} ${withIcon ? inputPaddingWithIcon : inputPadding} ${state}`
}

export const selectBase =
  'w-full appearance-none rounded-lg border bg-white py-2.5 pr-10 pl-3.5 font-dm-sans text-sm outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50'

export function selectClass(hasError: boolean, hasValue: boolean): string {
  const state = hasError
    ? 'border-error-red focus:border-error-red focus:ring-error-red/20'
    : 'border-gray-200 focus:border-primary-blue focus:ring-primary-blue/15'
  return `${selectBase} ${hasValue ? 'text-gray-900' : 'text-gray-500'} ${state}`
}
