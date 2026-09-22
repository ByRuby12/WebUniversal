import type { Business, ModuleKey } from '../types'

type RecommendationProfile = Record<ModuleKey, string>

const profiles: Record<string, RecommendationProfile> = {
  appointments: {
    bookings: 'Ideal para gestionar citas y horarios.',
    quotes: 'Solo si ofreces servicios a medida.',
    contact: 'Facilita consultas rapidas.',
    gallery: 'Muestra estilos y resultados.',
    reviews: 'La confianza ayuda a reservar.',
    faq: 'Resuelve dudas antes de la cita.',
    social: 'Ayuda a descubrir tu trabajo.',
    pricing: 'Util si tienes tarifas cerradas.',
    team: 'Presenta a profesionales y especialistas.',
    serviceArea: 'Aclara donde atiendes.',
  },
  projects: {
    bookings: 'Solo si necesitas visitas o reuniones.',
    quotes: 'Clave para trabajos personalizados.',
    contact: 'Recibe consultas de nuevos proyectos.',
    gallery: 'Enseña trabajos terminados y procesos.',
    reviews: 'Refuerza la confianza en proyectos grandes.',
    faq: 'Aclara materiales, plazos y condiciones.',
    social: 'Comparte avances y resultados.',
    pricing: 'Mejor como orientacion que como tarifa fija.',
    team: 'Presenta al equipo que ejecuta el proyecto.',
    serviceArea: 'Define las zonas donde trabajas.',
  },
  services: {
    bookings: 'Activalo si trabajas con citas previas.',
    quotes: 'Permite pedir una propuesta adaptada.',
    contact: 'Canal directo para nuevas consultas.',
    gallery: 'Ayuda a demostrar la calidad del servicio.',
    reviews: 'Las experiencias de clientes generan confianza.',
    faq: 'Reduce preguntas repetidas.',
    social: 'Amplia la visibilidad del negocio.',
    pricing: 'Recomendado si puedes mostrar precios claros.',
    team: 'Humaniza el servicio profesional.',
    serviceArea: 'Indica las zonas que cubres.',
  },
  professional: {
    bookings: 'Util para reuniones o sesiones programadas.',
    quotes: 'Activalo si cada servicio requiere valoracion.',
    contact: 'Esencial para recibir consultas.',
    gallery: 'Opcional, segun el tipo de trabajo.',
    reviews: 'Aporta credibilidad a nuevos clientes.',
    faq: 'Explica el proceso y las condiciones.',
    social: 'Ayuda a compartir contenido profesional.',
    pricing: 'Recomendado si trabajas con tarifas definidas.',
    team: 'Presenta experiencia y especialidades.',
    serviceArea: 'Aclara si atiendes presencialmente.',
  },
}

const sectorProfiles: Record<string, keyof typeof profiles> = {
  barber: 'appointments', beauty: 'appointments', mechanic: 'appointments', tires: 'appointments',
  detailing: 'appointments', photographer: 'appointments', videographer: 'appointments', trainer: 'appointments',
  pets: 'appointments', dental: 'appointments', clinic: 'appointments', academy: 'appointments', events: 'appointments', veterinary: 'appointments',
  plumber: 'services', electrician: 'services', locksmith: 'services', cleaning: 'services', gardening: 'services',
  moving: 'services', transport: 'services', climate: 'services', solar: 'services',
  renovation: 'projects', painter: 'projects', architect: 'projects', carpentry: 'projects', windows: 'projects',
  consulting: 'professional', lawyer: 'professional',
}

const fallbackProfile = profiles.services

function resolveSectorId(business: Business) {
  const knownId = Object.keys(sectorProfiles).find((sectorId) => business.id === sectorId || business.id.startsWith(`${sectorId}-`))
  if (knownId) return knownId
  const category = business.category.toLowerCase()
  return Object.keys(sectorProfiles).find((sectorId) => category.includes(sectorId)) ?? ''
}

export function getModuleRecommendation(business: Business, key: ModuleKey) {
  const profile = profiles[sectorProfiles[resolveSectorId(business)] ?? ''] ?? fallbackProfile
  const recommended = ['contact', 'reviews', 'faq', 'social'].includes(key) ||
    (profile === profiles.appointments && ['bookings', 'gallery', 'pricing'].includes(key)) ||
    (profile === profiles.projects && ['quotes', 'gallery', 'serviceArea'].includes(key)) ||
    (profile === profiles.services && ['quotes', 'serviceArea'].includes(key)) ||
    (profile === profiles.professional && ['contact', 'reviews', 'faq', 'team'].includes(key))

  return { recommended, note: profile[key] }
}
