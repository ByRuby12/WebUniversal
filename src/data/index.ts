import type { Business, BusinessTranslation } from '../types'
import { defaultModules } from './moduleCatalog'
import { sectorCatalog } from './sectorCatalog'
import { sectorContent } from './sectorContent'

export { defaultModules, moduleLabels } from './moduleCatalog'

export const buildBaseTranslation = (business: Partial<Business>): BusinessTranslation => ({
  name: business.name,
  description: business.description,
  category: business.category,
  phone: business.phone,
  email: business.email,
  address: business.address,
  hours: business.hours,
  about: business.about,
  story: business.story,
  services: business.services,
  process: business.process,
  serviceAreas: business.serviceAreas,
  faq: business.faq,
  pages: business.pages,
  legal: business.legal,
})

const englishCategory = (category = 'Business services') => {
  const value = category.toLowerCase()
  if (value.includes('limpieza')) return 'Cleaning company'
  if (value.includes('barber') || value.includes('pelu')) return 'Barber shop'
  if (value.includes('academ') || value.includes('profesor')) return 'Academic services'
  if (value.includes('arquitect') || value.includes('interior')) return 'Architecture & design'
  if (value.includes('gestor') || value.includes('asesor')) return 'Business consultancy'
  if (value.includes('marketing') || value.includes('seo')) return 'Marketing services'
  if (value.includes('legal') || value.includes('abogado')) return 'Legal services'
  return 'Professional services'
}

export const buildEnglishTranslation = (business: Partial<Business>): BusinessTranslation => {
  const businessName = business.name ?? 'Business name'
  const categoryLabel = englishCategory(business.category ?? 'Business services')

  return {
    name: businessName,
    description: business.description ? business.description.replace(/\s+/g, ' ').trim() : 'Professional services designed around your needs.',
    category: categoryLabel,
    phone: business.phone ?? '+34 600 000 000',
    email: business.email ?? 'hello@business.com',
    address: business.address ?? 'Madrid and surrounding areas',
    hours: business.hours ?? 'Monday to Friday, 09:00 - 19:00',
    about: `We provide professional, close and tailored support for ${businessName}, focused on quality, clarity and a smooth customer experience.`,
    story: `We created ${businessName} to offer a clear and trustworthy experience from the first contact to the final result.`,
    services: ['Main service', 'Personalized service', 'After-sales support'],
    process: ['Tell us what you need', 'We prepare a tailored proposal', 'We carry out the work with care', 'We review the final result together'],
    serviceAreas: ['Madrid', 'Greater Madrid', 'Online'],
    faq: [
      { question: 'How can I request information?', answer: 'You can send your enquiry through the form and we will get back to you as soon as possible.' },
      { question: 'What areas do you cover?', answer: 'We work throughout the city and surrounding areas, and we can also support you online.' },
      { question: 'Can I book a first meeting?', answer: 'Yes. We can arrange an initial consultation to understand your needs and recommend the best option.' },
    ],
    pages: [{ id: 'inicio', label: 'Home', title: 'Welcome', intro: 'A clear, professional experience for every client.', body: 'We take care of every detail to offer a simple, reliable and efficient service.', published: true }, { id: 'servicios', label: 'Services', title: 'Solutions designed for you', intro: 'Everything you need in one place.', body: 'We adapt our approach to your needs and the result you want to achieve.', published: true }],
    legal: {
      privacy: 'We use your data only to manage your enquiry, provide the requested service and maintain clear communication with you.',
      terms: 'Schedules, prices and scope will be confirmed before starting any work or service. We can adapt the proposal to your needs.',
      returns: 'Any modifications, cancellations or refunds will be managed according to the agreed conditions and the work already carried out.',
      support: 'For support or questions, contact us through the form or by email and we will reply as soon as possible.',
    },
  }
}

const ensureBilingualBusiness = (business: Business): Business => ({
  ...business,
  englishEnabled: true,
  language: 'es',
  translations: {
    es: buildBaseTranslation(business),
    en: buildEnglishTranslation(business),
  },
})

const images = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=85',
  barber: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85',
  home: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
}
export const seeds: Business[] = [
  { id: 'cleaning', name: 'Brillo & Orden', description: 'Limpieza que se nota', category: 'Empresa de limpieza', color: '#d96949', image: images.cleaning, modules: defaultModules(), requestMode: 'presupuesto', language: 'es', englishEnabled: false, phone: '+34 600 123 456', email: 'hola@brilloyorden.es', address: 'Madrid y alrededores', hours: 'Lunes a viernes, 09:00 - 19:00', about: 'Cuidamos cada espacio con un servicio cercano, puntual y profesional.', story: 'Brillo & Orden nacio para hacer que volver a casa se sienta mejor.', services: ['Limpieza general', 'Limpieza profunda', 'Fin de obra'], process: ['Cuéntanos qué necesitas', 'Preparamos una propuesta clara', 'Lo hacemos realidad contigo'], serviceAreas: ['Madrid', 'Getafe', 'Leganés'], gallery: [images.cleaning, images.home, images.cleaning], faq: [{ question: '¿Como solicito presupuesto?', answer: 'Escribenos desde el formulario y te responderemos lo antes posible.' }, { question: '¿Que zonas cubris?', answer: 'Trabajamos en Madrid y localidades cercanas.' }], socialLinks: [{ name: 'Instagram', url: 'https://instagram.com/' }, { name: 'Facebook', url: 'https://facebook.com/' }], pages: [{ id: 'inicio', label: 'Inicio', title: 'Limpieza que se nota', intro: 'Todo en orden, sin complicaciones.', body: 'Un equipo profesional para cuidar cada detalle.', published: true }, { id: 'servicios', label: 'Servicios', title: 'Soluciones pensadas para ti', intro: 'Un servicio claro y adaptado.', body: 'Elige la ayuda que necesita tu espacio.', published: true }], reviews: [{ id: 1, name: 'Maria G.', rating: 5, text: 'Muy profesionales y cuidadosos. El piso quedo impecable.', createdAt: '2026-09-12', approved: true }], bookingSlots: 'Lunes|10:00-17:00|60\nMartes|10:00-17:00|60\nMiercoles|10:00-17:00|60\nJueves|10:00-17:00|60\nViernes|10:00-17:00|60', blockedDates: [], views: 128, published: true, translations: { en: {} } },
  { id: 'barber', name: 'Norte Barber Club', description: 'Cortes con carácter', category: 'Barberia / Peluqueria', color: '#263b73', image: images.barber, modules: defaultModules({ bookings: true, quotes: false }), requestMode: 'reserva', language: 'es', englishEnabled: false, phone: '+34 600 222 333', email: 'hola@nortebarber.es', address: 'Madrid', hours: 'Martes a sabado, 10:00 - 20:00', about: 'Una barberia contemporanea para cortes con personalidad.', story: 'Tradicion, detalle y una experiencia hecha para ti.', services: ['Corte clasico', 'Barba y afeitado', 'Corte premium'], process: ['Reserva tu hora', 'Te asesoramos', 'Disfruta el resultado'], serviceAreas: ['Madrid'], gallery: [images.barber], faq: [], socialLinks: [{ name: 'Instagram', url: 'https://instagram.com/' }], pages: [{ id: 'inicio', label: 'Inicio', title: 'Cortes con carácter', intro: 'Tu estilo empieza aqui.', body: 'Una experiencia de barberia cercana y precisa.', published: true }], reviews: [], bookingSlots: 'Martes|10:00-20:00|60\nMiercoles|10:00-20:00|60\nJueves|10:00-20:00|60\nViernes|10:00-20:00|60\nSabado|10:00-20:00|60', blockedDates: [], views: 64, published: true, translations: { en: {} } },
]
export const createBusiness = (template: Business, name: string, description: string): Business => ({
  ...template,
  id: `${template.id}-${Date.now()}`,
  name,
  description,
  englishEnabled: true,
  language: 'es',
  translations: {
    es: buildBaseTranslation({ ...template, name, description }),
    en: buildEnglishTranslation({ ...template, name, description }),
  },
  views: 0,
  reviews: [],
})

const catalogBusiness = (sector: (typeof sectorCatalog)[number]): Business => {
  const baseBusiness: Business = {
    id: sector.id,
    name: sector.name,
    description: sector.description,
    category: sector.category,
    color: sector.color,
    image: sector.image,
    modules: defaultModules({ bookings: Boolean(sector.bookings), quotes: Boolean(sector.quotes) }),
    requestMode: sector.bookings ? 'reserva' : sector.quotes ? 'presupuesto' : 'consulta',
    englishEnabled: true,
    language: 'es',
    phone: '+34 600 123 456',
    email: `hola@${sector.id}.es`,
    address: 'Madrid y alrededores',
    hours: 'Lunes a viernes, 09:00 - 19:00',
    about: `Un servicio profesional y cercano de ${sector.category.toLowerCase()}, pensado para cada cliente.`,
    story: `${sector.name} nace para hacer las cosas con mas cuidado, claridad y atencion al detalle.`,
    services: ['Servicio principal', 'Servicio personalizado', 'Atencion y seguimiento'],
    process: ['Cuéntanos qué necesitas', 'Preparamos una propuesta clara', 'Lo hacemos realidad contigo'],
    serviceAreas: ['Madrid', 'Getafe', 'Leganés'],
    gallery: [sector.image],
    faq: [{ question: '¿Como puedo solicitar informacion?', answer: 'Escribenos desde el formulario y te responderemos lo antes posible.' }],
    socialLinks: [{ name: 'Instagram', url: 'https://instagram.com/' }],
    pages: [{ id: 'inicio', label: 'Inicio', title: sector.description, intro: 'Una experiencia pensada para ti.', body: sector.name, published: true }, { id: 'servicios', label: 'Servicios', title: 'Soluciones profesionales', intro: 'Conoce todo lo que podemos hacer.', body: 'Contacta con nuestro equipo para conocer todos los detalles.', published: true }],
    reviews: [],
    bookingSlots: 'Lunes|10:00-17:00|60\nMartes|10:00-17:00|60\nMiercoles|10:00-17:00|60\nJueves|10:00-17:00|60\nViernes|10:00-17:00|60',
    blockedDates: [],
    views: 0,
    published: true,
    ...sectorContent[sector.id],
  }

  return ensureBilingualBusiness(baseBusiness)
}

export const allBusinesses: Business[] = [...seeds.map(ensureBilingualBusiness), ...sectorCatalog.filter((sector) => !seeds.some((business) => business.id === sector.id)).map(catalogBusiness)]
