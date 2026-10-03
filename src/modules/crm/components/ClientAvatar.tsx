import { getClientAccent, getInitials } from '../lib/clientIdentity'

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-lg',
}

interface ClientAvatarProps {
  idCliente: number
  primerNombre: string
  primerApellido: string
  size?: AvatarSize
}

function ClientAvatar({
  idCliente,
  primerNombre,
  primerApellido,
  size = 'md',
}: ClientAvatarProps) {
  const accent = getClientAccent(idCliente)
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-sora font-semibold ${SIZE_CLASSES[size]} ${accent.avatar}`}
    >
      {getInitials(primerNombre, primerApellido)}
    </span>
  )
}

export default ClientAvatar
