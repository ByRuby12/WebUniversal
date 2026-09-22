import type { ModuleKey } from '../types'

export const moduleLabels: Record<ModuleKey, string> = {
  bookings: 'Reservas y citas',
  quotes: 'Solicitar presupuesto',
  contact: 'Contacto directo',
  gallery: 'Galeria de trabajos',
  reviews: 'Resenas y testimonios',
  faq: 'Preguntas frecuentes',
  social: 'Redes sociales',
  pricing: 'Precios y tarifas',
  team: 'Equipo profesional',
  serviceArea: 'Zona de servicio',
}

export const defaultModules = (overrides: Partial<Record<ModuleKey, boolean>> = {}): Record<ModuleKey, boolean> => ({
  bookings: false,
  quotes: true,
  contact: true,
  gallery: true,
  reviews: true,
  faq: true,
  social: true,
  pricing: true,
  team: true,
  serviceArea: true,
  ...overrides,
})
