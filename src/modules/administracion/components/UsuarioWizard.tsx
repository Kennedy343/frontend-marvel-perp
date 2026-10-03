import type { ReactNode } from 'react'
import Icon from '../../../components/common/Icon'
import type { UsuarioFormStep } from '../lib/usuarioForm'

export interface UsuarioAssignmentSummary {
  roles: number
  sucursales: number
}

interface UsuarioWizardProps {
  title: string
  description: string
  breadcrumb?: readonly string[]
  steps: readonly UsuarioFormStep[]
  step: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
  savingLabel: string
  isSubmitting: boolean
  isSuccess: boolean
  isLoading?: boolean
  feedbackError?: string | null
  assignmentSummary?: UsuarioAssignmentSummary
  children: ReactNode
}

function stepNodeClass(state: 'active' | 'done' | 'upcoming') {
  if (state === 'active') return 'bg-primary-blue text-white ring-4 ring-primary-blue/15'
  if (state === 'done') return 'bg-emerald-100 text-emerald-700'
  return 'bg-gray-100 text-gray-500'
}

function stepLabelClass(state: 'active' | 'done' | 'upcoming') {
  if (state === 'active') return 'text-navy-950'
  if (state === 'done') return 'text-navy-950'
  return 'text-gray-500'
}

function getStepState(number: number, step: number): 'active' | 'done' | 'upcoming' {
  if (number === step) return 'active'
  if (number < step) return 'done'
  return 'upcoming'
}

function UsuarioWizardRail({
  steps,
  step,
  isLocked,
  onStepChange,
  assignmentSummary,
}: {
  steps: readonly UsuarioFormStep[]
  step: number
  isLocked: boolean
  onStepChange: (step: number) => void
  assignmentSummary?: UsuarioAssignmentSummary
}) {
  return (
    <div className="hidden lg:sticky lg:top-8 lg:block">
      <p className="font-dm-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Procedimiento
      </p>
      <ol className="mt-4">
        {steps.map((item, index) => {
          const number = index + 1
          const state = getStepState(number, step)
          const isLast = index === steps.length - 1
          return (
            <li key={item.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepChange(number)}
                  disabled={isLocked}
                  aria-current={state === 'active' ? 'step' : undefined}
                  aria-label={`Ir al paso ${number}: ${item.label}`}
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-sora text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed ${stepNodeClass(state)}`}
                >
                  {state === 'done' ? <Icon name="icon-check" className="size-4" /> : number}
                </button>
                {isLast ? null : <span className="w-px flex-1 bg-gray-200" />}
              </div>
              <button
                type="button"
                onClick={() => onStepChange(number)}
                disabled={isLocked}
                className={`text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed ${isLast ? '' : 'pb-7'}`}
              >
                <span className={`block font-sora text-sm font-semibold ${stepLabelClass(state)}`}>
                  {item.label}
                </span>
                <span className="mt-0.5 block font-dm-sans text-xs text-gray-500">
                  {item.hint}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {assignmentSummary ? (
        <div className="mt-6 rounded-xl border border-gray-200/80 bg-white p-4 shadow-soft">
          <p className="font-dm-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Asignación
          </p>
          <dl className="mt-3 space-y-2">
            <SummaryRow label="Roles" value={assignmentSummary.roles} />
            <SummaryRow label="Sucursales" value={assignmentSummary.sucursales} />
          </dl>
        </div>
      ) : null}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="font-dm-sans text-sm text-gray-500">{label}</dt>
      <dd className="rounded-md bg-gray-100 px-2 py-0.5 font-dm-sans text-xs font-semibold tabular-nums text-navy-950">
        {value}
      </dd>
    </div>
  )
}

function UsuarioWizardStepsMobile({
  steps,
  step,
  isLocked,
  onStepChange,
}: {
  steps: readonly UsuarioFormStep[]
  step: number
  isLocked: boolean
  onStepChange: (step: number) => void
}) {
  return (
    <nav aria-label="Progreso" className="flex items-center gap-3 lg:hidden">
      {steps.map((item, index) => {
        const number = index + 1
        const state = getStepState(number, step)
        return (
          <div key={item.label} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onStepChange(number)}
              disabled={isLocked}
              aria-current={state === 'active' ? 'step' : undefined}
              className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed"
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full font-sora text-xs font-semibold ${stepNodeClass(state)}`}
              >
                {state === 'done' ? <Icon name="icon-check" className="size-4" /> : number}
              </span>
              <span
                className={`font-dm-sans text-sm font-medium ${stepLabelClass(state)}`}
              >
                {item.label}
              </span>
            </button>
            {number < steps.length ? <span className="h-px w-6 bg-gray-200" /> : null}
          </div>
        )
      })}
    </nav>
  )
}

function UsuarioWizard({
  title,
  description,
  breadcrumb,
  steps,
  step,
  onStepChange,
  onSubmit,
  onCancel,
  submitLabel,
  savingLabel,
  isSubmitting,
  isSuccess,
  isLoading = false,
  feedbackError,
  assignmentSummary,
  children,
}: UsuarioWizardProps) {
  const isLastStep = step >= steps.length
  const isLocked = isSubmitting || isSuccess

  return (
    <div className="mx-auto max-w-7xl motion-safe:animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {breadcrumb && breadcrumb.length > 0 ? (
            <p className="font-dm-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {breadcrumb.map((part, index) => (
                <span key={`${part}-${index}`}>
                  {index > 0 ? <span className="mx-2">›</span> : null}
                  {part}
                </span>
              ))}
            </p>
          ) : null}
          <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 font-dm-sans text-sm text-gray-500">{description}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 font-dm-sans text-xs font-semibold text-primary-blue">
          Paso {Math.min(step, steps.length)} de {steps.length}
        </span>
      </div>

      {feedbackError && !isSuccess ? (
        <div
          role="alert"
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm font-medium text-error-red shadow-sm"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error-red text-white">
            <Icon name="icon-close" className="size-4" />
          </div>
          <p>{feedbackError}</p>
        </div>
      ) : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-10">
        <UsuarioWizardRail
          steps={steps}
          step={step}
          isLocked={isLocked}
          onStepChange={onStepChange}
          assignmentSummary={assignmentSummary}
        />

        <div className="space-y-6">
          {isLoading ? (
            <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-soft">
              Cargando datos del usuario…
            </p>
          ) : (
            <>
              <UsuarioWizardStepsMobile
                steps={steps}
                step={step}
                isLocked={isLocked}
                onStepChange={onStepChange}
              />
              {children}
            </>
          )}

          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white/85 px-4 py-3 shadow-soft backdrop-blur">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLocked}
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            {isLoading ? null : isLastStep ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStepChange(step - 1)}
                  disabled={isLocked}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-dm-sans text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLocked}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? savingLabel : submitLabel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onStepChange(step + 1)}
                disabled={isLocked}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-6 py-2.5 font-dm-sans text-sm font-semibold text-white shadow-soft transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-not-allowed disabled:opacity-60"
              >
                Siguiente
                <Icon name="icon-chevron-down" className="size-4 -rotate-90" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsuarioWizard
