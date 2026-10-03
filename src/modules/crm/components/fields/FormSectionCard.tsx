import type { ReactNode } from 'react'
import Icon from '../../../../components/common/Icon'
import type { IconName } from '../../../../components/common/Icon'

interface FormSectionCardProps {
  icon: IconName
  title: string
  children: ReactNode
}

function FormSectionCard({ icon, title, children }: FormSectionCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-center gap-3">
        <Icon name={icon} className="size-5 shrink-0 text-primary-blue" />
        <h2 className="font-sora text-base font-semibold text-navy-950 sm:text-lg">{title}</h2>
        <div className="h-px flex-1 bg-gray-200/80" />
      </div>

      <div className="mt-6 space-y-5">{children}</div>
    </article>
  )
}

export default FormSectionCard
