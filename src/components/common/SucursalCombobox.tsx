import { useMemo, type ReactNode } from 'react'
import FilterCombobox, { type FilterOption } from './FilterCombobox'
import type { SucursalInventario } from '../../modules/inventario/types/inventarioSucursal'

interface SucursalComboboxProps {
  sucursales: SucursalInventario[]
  value: number | undefined
  onChange: (id: number | undefined) => void
  id?: string
  allowAll?: boolean
  placeholder?: ReactNode
  className?: string
}

function SucursalCombobox({
  sucursales,
  value,
  onChange,
  id,
  allowAll = true,
  placeholder,
  className,
}: SucursalComboboxProps) {
  const items = useMemo<FilterOption[]>(
    () =>
      sucursales.map((sucursal) => ({
        value: sucursal.idSucursal,
        label: sucursal.nombreSucursal,
      })),
    [sucursales],
  )

  return (
    <FilterCombobox
      id={id}
      items={items}
      allLabel={allowAll ? 'Todas las sucursales' : undefined}
      placeholder={placeholder}
      emptyLabel="No se encontraron sucursales."
      ariaLabel="Sucursal"
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}

export default SucursalCombobox
