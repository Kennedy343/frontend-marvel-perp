export default function ProveedorFormSkeleton() {
  return (
    <div role="status" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <span className="sr-only">Cargando datos del proveedor…</span>
      <div
        aria-hidden="true"
        className="h-96 rounded-2xl border border-gray-200/80 bg-white shadow-soft motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="h-96 rounded-2xl border border-gray-200/80 bg-white shadow-soft motion-safe:animate-pulse"
      />
    </div>
  )
}
