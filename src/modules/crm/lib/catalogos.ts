import type { IconName } from '../../../components/common/Icon'

export type CatalogoKind = 'departamento' | 'municipio' | 'comunidad' | 'sector' | 'categoria'

export interface CatalogoMeta {
  title: string
  fieldLabel: string
  placeholder: string
  helpText: string
  icon: IconName
  permission: string
}

export const CATALOGO_META: Record<CatalogoKind, CatalogoMeta> = {
  departamento: {
    title: 'Nuevo Departamento',
    fieldLabel: 'Nombre del departamento',
    placeholder: 'Ej. Guatemala',
    helpText: 'El nuevo departamento quedará seleccionado automáticamente.',
    icon: 'icon-map-pin',
    permission: 'crear:departamentos',
  },
  municipio: {
    title: 'Nuevo Municipio',
    fieldLabel: 'Nombre del municipio',
    placeholder: 'Ej. Villa Nueva',
    helpText: 'El nuevo municipio quedará seleccionado automáticamente.',
    icon: 'icon-map-pin',
    permission: 'crear:municipios',
  },
  comunidad: {
    title: 'Nueva Comunidad',
    fieldLabel: 'Nombre de la comunidad',
    placeholder: 'Ej. Colonia El Centro',
    helpText: 'La nueva comunidad quedará seleccionada automáticamente.',
    icon: 'icon-map-pin',
    permission: 'crear:comunidades',
  },
  sector: {
    title: 'Nuevo Sector',
    fieldLabel: 'Nombre del sector',
    placeholder: 'Ej. Zona 1',
    helpText: 'El nuevo sector quedará seleccionado automáticamente.',
    icon: 'icon-map-pin',
    permission: 'crear:sectores',
  },
  categoria: {
    title: 'Nueva Categoría',
    fieldLabel: 'Nombre de la categoría',
    placeholder: 'Ej. VIP',
    helpText: 'La nueva categoría quedará seleccionada automáticamente.',
    icon: 'icon-crm',
    permission: 'crear:categorias',
  },
}

export const CATALOGO_KINDS = Object.keys(CATALOGO_META) as CatalogoKind[]
