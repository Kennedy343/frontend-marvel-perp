import type { ReactNode } from 'react'
import Icon from '../../../components/common/Icon'
import type { IconName } from '../../../components/common/Icon'

interface ProveedorSectionCardProps {
  icon: IconName
  title: string
  description?: string
  children: ReactNode
}

export default function ProveedorSectionCard({
  icon,
  title,
  description,
  children,
}: ProveedorSectionCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <Icon name={icon} className="size-5 shrink-0 text-primary-blue" />
        <h2 className="font-sora text-base font-semibold text-navy-950">{title}</h2>
        <div className="h-px flex-1 bg-gray-200/80" />
      </div>
      {description ? <p className="mt-3 text-xs text-gray-500">{description}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}
