interface ProveedorFormHeaderProps {
  breadcrumbLabel: string
  title: string
  subtitle: string
}

export default function ProveedorFormHeader({
  breadcrumbLabel,
  title,
  subtitle,
}: ProveedorFormHeaderProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        Compras <span className="mx-2">›</span> Proveedores <span className="mx-2">›</span>{' '}
        {breadcrumbLabel}
      </p>
      <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 font-dm-sans text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}
