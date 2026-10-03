import sprite from '../../assets/sprite.svg?raw'

export type IconName =
  | 'icon-dashboard'
  | 'icon-crm'
  | 'icon-check'
  | 'icon-chevron-down'
  | 'icon-sidebar-down'
  | 'icon-sidebar-up'
  | 'icon-search'
  | 'icon-bell'
  | 'icon-settings'
  | 'icon-help'
  | 'icon-logout'
  | 'icon-menu'
  | 'icon-close'
  | 'icon-user'
  | 'icon-map-pin'
  | 'icon-phone'
  | 'icon-plus'
  | 'icon-eye'
  | 'icon-plus-circle'
  | 'icon-edit'
  | 'icon-trash'
  | 'icon-download'
  | 'icon-inventory'
  | 'icon-sales'
  | 'icon-truck'
  | 'icon-calendar'
  | 'icon-clock'
  | 'icon-cart'
  | 'icon-arrow-down-circle'
  | 'icon-arrow-up-circle'
  | 'icon-transfer'
  | 'icon-refresh'
  | 'icon-chevron-left'
  | 'icon-chevron-right'
  | 'icon-eye-off'
  | 'icon-lock-open'
  | 'icon-price-circle'
  | 'icon-production-quantity-limits'

let spriteInjected = false

function injectSprite() {
  if (spriteInjected || typeof document === 'undefined') return

  const container = document.createElement('div')
  container.innerHTML = sprite
  const spriteElement = container.firstElementChild

  if (spriteElement) {
    document.body.prepend(spriteElement)
    spriteInjected = true
  }
}

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  injectSprite()

  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`#${name}`} />
    </svg>
  )
}

export default Icon
