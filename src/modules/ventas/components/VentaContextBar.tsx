import { memo, useState } from 'react'
import Icon from '../../../components/common/Icon'
import type { Client } from '../../crm/types/client'
import type { SucursalInventario } from '../../inventario/types/inventarioSucursal'
import type { SucursalVentaMode } from '../hooks/useCreateVenta'
import { ClienteCombobox } from './ClienteCombobox'
import QuickCreateClienteModal from './QuickCreateClienteModal'

interface VentaContextBarProps {
  formData: {
    idCliente: string
    idSucursal: string
    fechaVenta: string
  }
  errors: Record<string, string>
  clientes: Client[]
  sucursales: SucursalInventario[]
  sucursalMode: SucursalVentaMode
  sucursalFija: SucursalInventario | null
  showSucursal: boolean
  clienteSearchTerm: string
  onClienteSearchChange: (value: string) => void
  onClienteSelect: (idCliente: string) => void
  onClienteCreated: (created: Client) => void
  isSearchingClientes?: boolean
  isLoading: boolean
  onChange: (field: string, value: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return 'Hoy'
  const parsed = new Date(`${isoDate}T00:00:00`)
  return isNaN(parsed.getTime()) ? isoDate : dateFormatter.format(parsed)
}

function getClientFullName(c: Client): string {
  const parts = [c.primerNombre, c.segundoNombre, c.primerApellido, c.segundoApellido]
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

export const VentaContextBar = memo(function VentaContextBar({
  formData,
  errors,
  clientes,
  sucursales,
  sucursalMode,
  sucursalFija,
  showSucursal,
  clienteSearchTerm,
  onClienteSearchChange,
  onClienteSelect,
  onClienteCreated,
  isSearchingClientes = false,
  isLoading,
  onChange,
}: VentaContextBarProps) {
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false)

  const handleOpenCreateCliente = () => setIsClienteModalOpen(true)

  const selectedClient = clientes.find((c) => String(c.idCliente) === formData.idCliente)
  const isSucursalAuto = sucursalMode === 'auto' && sucursalFija !== null
  const sucursalLabel = isSucursalAuto ? sucursalFija.nombreSucursal : 'Seleccionar sucursal…'
  const sucursalValue = isSucursalAuto ? String(sucursalFija.idSucursal) : formData.idSucursal
  const resolvedSucursalId = sucursalFija?.idSucursal ?? (formData.idSucursal ? Number(formData.idSucursal) : undefined)

  const handleClearClient = () => {
    onClienteSelect('')
    onClienteSearchChange('')
  }

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-card transition-all">
      <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-12">
        {/* Cliente Context (6 cols / 10 cols sin sucursal) */}
        <div className={showSucursal ? 'lg:col-span-6' : 'lg:col-span-10'}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Icon name="icon-user" className="size-3.5 text-primary-blue" />
              <span>Cliente *</span>
            </span>
            {selectedClient && (
              <button
                type="button"
                onClick={handleClearClient}
                className="font-dm-sans text-xs font-medium text-gray-400 transition-colors hover:text-error-red"
              >
                Cambiar cliente
              </button>
            )}
          </div>

          {selectedClient ? (
            <div className="mt-1.5 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-blue font-sora text-xs font-bold text-white shadow-xs">
                  {selectedClient.primerNombre.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-dm-sans text-sm font-semibold text-navy-950">
                    {getClientFullName(selectedClient)}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {selectedClient.nit
                      ? `NIT: ${selectedClient.nit}`
                      : selectedClient.dpiCliente
                        ? `DPI: ${selectedClient.dpiCliente}`
                        : 'Consumidor Final'}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-100/70 px-2 py-0.5 font-dm-sans text-[11px] font-medium text-primary-blue">
                <Icon name="icon-check" className="size-3" />
                <span>Asignado</span>
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <ClienteCombobox
                  clientes={clientes}
                  selectedId={formData.idCliente}
                  searchTerm={clienteSearchTerm}
                  onSearchChange={onClienteSearchChange}
                  onSelect={onClienteSelect}
                  onOpenCreate={handleOpenCreateCliente}
                  isLoading={isSearchingClientes}
                  hasError={Boolean(errors.idCliente)}
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCliente}
                disabled={!resolvedSucursalId}
                title={
                  resolvedSucursalId
                    ? 'Crear nuevo cliente'
                    : 'Seleccione una sucursal de despacho para crear un cliente'
                }
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2.5 font-dm-sans text-xs font-semibold text-primary-blue shadow-xs transition-colors hover:bg-blue-100/80 focus-visible:outline-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-50/70"
              >
                <Icon name="icon-plus" className="size-3.5" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          )}
          {errors.idCliente && (
            <p className="mt-1 font-dm-sans text-xs text-error-red">{errors.idCliente}</p>
          )}
        </div>

        {/* Sucursal de Despacho (4 cols) — solo administradores eligen la sucursal */}
        {showSucursal && (
          <div className="lg:col-span-4">
            <span className="mb-1 flex items-center gap-1.5 font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Icon name="icon-map-pin" className="size-3.5 text-primary-blue" />
              <span>Sucursal de Despacho{isSucursalAuto ? '' : ' *'}</span>
            </span>

            {isSucursalAuto ? (
              <div
                id="venta-sucursal-fija"
                className="flex h-10 items-center gap-2.5 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 font-dm-sans text-sm font-medium text-emerald-900"
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="truncate font-semibold">{sucursalLabel}</span>
                <span className="ml-auto rounded bg-emerald-100/80 px-1.5 py-0.5 font-mono text-[10px] uppercase font-bold text-emerald-800">
                  Fija
                </span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="venta-sucursal-select"
                  aria-label="Sucursal de despacho"
                  disabled={isLoading}
                  value={sucursalValue}
                  onChange={(e) => onChange('idSucursal', e.target.value)}
                  className={`h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-8 font-dm-sans text-sm font-medium text-navy-950 transition-colors focus:border-primary-blue focus:outline-none disabled:bg-gray-50 ${
                    errors.idSucursal ? 'border-error-red bg-red-50/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option value="">{sucursalLabel}</option>
                  {sucursales.map((s) => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombreSucursal}
                      {s.codigoSucursal ? ` (${s.codigoSucursal})` : ''}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                  <Icon name="icon-chevron-down" className="size-3.5" />
                </span>
              </div>
            )}
            {errors.idSucursal && (
              <p className="mt-1 font-dm-sans text-xs text-error-red">{errors.idSucursal}</p>
            )}
          </div>
        )}

        {/* Fecha de Emisión (2 cols) */}
        <div className="lg:col-span-2">
          <span className="mb-1 flex items-center gap-1.5 font-dm-sans text-xs font-semibold uppercase tracking-wider text-gray-500">
            <Icon name="icon-calendar" className="size-3.5 text-gray-400" />
            <span>Fecha</span>
          </span>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 font-dm-sans text-sm font-medium text-navy-950">
            <span className="truncate">{formatDisplayDate(formData.fechaVenta)}</span>
          </div>
        </div>
      </div>

      {isClienteModalOpen && (
        <QuickCreateClienteModal
          idSucursal={resolvedSucursalId}
          onClose={() => setIsClienteModalOpen(false)}
          onSuccess={onClienteCreated}
        />
      )}
    </section>
  )
})
