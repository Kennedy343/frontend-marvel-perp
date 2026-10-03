import type { IconName } from '../components/common/Icon'

export interface NavigationItem {
  key: string
  label: string
  path: string
  icon?: IconName
  recurso?: string
  permiso?: string
  children?: NavigationItem[]
}

export interface NavigationSection {
  label?: string
  items: NavigationItem[]
}
