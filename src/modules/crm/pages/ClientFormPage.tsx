import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import ClientForm from '../components/ClientForm'
import { useClientForm } from '../hooks/useClientForm'
import type { ClientFormMode } from '../hooks/useClientForm'
import type { ClientFormData } from '../types/client'

interface PageContent {
  breadcrumbLabel: string
  title: string
  subtitle: string
  submitLabel: string
  loadingSubmitLabel: string
}

const PAGE_CONTENT: Record<ClientFormMode, PageContent> = {
  create: {
    breadcrumbLabel: 'Nuevo',
    title: 'Nuevo Cliente',
    subtitle: 'Complete la información para registrar un nuevo cliente en el sistema.',
    submitLabel: 'Guardar Cliente',
    loadingSubmitLabel: 'Guardando cliente…',
  },
  edit: {
    breadcrumbLabel: 'Editar',
    title: 'Editar Cliente',
    subtitle: 'Actualice la información del cliente.',
    submitLabel: 'Guardar Cambios',
    loadingSubmitLabel: 'Guardando cambios…',
  },
}

function buildFullName(formData: ClientFormData): string {
  return [
    formData.primerNombre,
    formData.segundoNombre,
    formData.primerApellido,
    formData.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ClientFormSkeleton() {
  return (
    <div role="status" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <span className="sr-only">Cargando datos del cliente…</span>
      <div aria-hidden="true" className="h-96 rounded-2xl border border-gray-200/80 bg-white shadow-soft motion-safe:animate-pulse" />
      <div aria-hidden="true" className="h-96 rounded-2xl border border-gray-200/80 bg-white shadow-soft motion-safe:animate-pulse" />
    </div>
  )
}

function ClientFormPage() {
  const navigate = useNavigate()
  const { idCliente } = useParams()
  const form = useClientForm(idCliente)
  const content = PAGE_CONTENT[form.mode]

  const handleCancel = () => navigate('/crm/clientes')

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nombreCompleto = buildFullName(form.formData)
    const isEdit = form.mode === 'edit'
    const successMessage = isEdit ? 'Cliente actualizado' : 'Cliente creado'
    const successVerb = isEdit ? 'actualizado' : 'registrado'

    await toast
      .promise(
        (async () => {
          const ok = await form.handleSubmit()
          if (!ok) throw new Error('submit-failed')
          return ok
        })(),
        {
          id: `${form.mode}-cliente`,
          loading: content.loadingSubmitLabel,
          success: {
            message: successMessage,
            description: nombreCompleto
              ? `${nombreCompleto} fue ${successVerb} correctamente.`
              : `El cliente fue ${successVerb} correctamente.`,
          },
          error: {
            message: isEdit ? 'No se pudo actualizar el cliente' : 'No se pudo registrar el cliente',
            description: 'Revisa los datos marcados e inténtalo de nuevo.',
          },
        },
      )
      .unwrap()
      .then(() => navigate('/crm/clientes'))
      .catch(() => {})
  }

  const subtitle =
    form.mode === 'edit' && form.client
      ? `Modificando los datos de ${form.client.primerNombre} ${form.client.primerApellido}`
      : content.subtitle

  return (
    <div className="mx-auto max-w-7xl space-y-6 motion-safe:animate-rise">
      <div>
        <p className="text-sm text-gray-500">
          CRM <span className="mx-2">›</span> Clientes <span className="mx-2">›</span>{' '}
          {content.breadcrumbLabel}
        </p>
        <h1 className="mt-2 font-sora text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
          {content.title}
        </h1>
        <p className="mt-1 font-dm-sans text-sm text-gray-500">{subtitle}</p>
      </div>

      {form.isLoadingCatalogs ? (
        <ClientFormSkeleton />
      ) : (
        <ClientForm
          form={form}
          submitLabel={content.submitLabel}
          loadingSubmitLabel={content.loadingSubmitLabel}
          onSubmit={onFormSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default ClientFormPage
