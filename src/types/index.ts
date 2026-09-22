export type ModuleKey = 'bookings' | 'quotes' | 'contact' | 'gallery' | 'reviews' | 'faq' | 'social' | 'pricing' | 'team' | 'serviceArea'
export type RequestType = 'consulta' | 'reserva' | 'presupuesto'
export type RequestStatus = 'nueva' | 'en estudio' | 'confirmada' | 'cancelada'

export interface Review { id: number; name: string; rating: number; text: string; createdAt: string; approved: boolean }
export interface BusinessPage { id: string; label: string; title: string; intro: string; body: string; published: boolean }
export interface LegalContent { privacy: string; terms: string; returns: string; support: string }
export interface BusinessTranslation {
  name?: string; description?: string; category?: string; phone?: string; email?: string; address?: string; hours?: string
  about?: string; story?: string; services?: string[]; process?: string[]; serviceAreas?: string[]
  faq?: Array<{ question: string; answer: string }>; pages?: BusinessPage[]; legal?: LegalContent
}
export interface Business {
  id: string; name: string; description: string; category: string; color: string; image: string
  modules: Record<ModuleKey, boolean>; requestMode?: RequestType; language?: 'es' | 'en'; englishEnabled?: boolean; phone: string; email: string; address: string; hours: string
  about: string; story: string; services: string[]; process: string[]; serviceAreas: string[]
  gallery: string[]; faq: Array<{ question: string; answer: string }>; socialLinks: Array<{ name: string; url: string }>
  pages: BusinessPage[]; reviews: Review[]; bookingSlots: string; blockedDates: string[]; views: number; published: boolean; legal?: LegalContent
  publicSettings?: Partial<Pick<Settings, 'publicForms' | 'showWhatsApp' | 'darkMode' | 'cookieBanner' | 'analyticsEnabled' | 'maintenanceMode' | 'siteLanguage' | 'seoTitle' | 'seoDescription' | 'seoKeywords' | 'faviconUrl' | 'contactEmail' | 'searchIndexing'>>
  translations?: Partial<Record<'es' | 'en', BusinessTranslation>>
}
export interface RequestItem {
  id: number; type: RequestType; businessId: string; name: string; phone: string; email: string
  subject: string; detail: string; service?: string; area?: string; budget?: string; preferredContact?: string; preferredDate?: string; preferredTime?: string
  status: RequestStatus; responseStatus: 'pendiente' | 'contestado'; responseNote?: string; createdAt: string
}
export interface BusinessMetric {
  id: string
  views: number
  requests: number
  conversion: number
  published: boolean
  updatedAt?: string
}
export interface DashboardStats {
  totalViews: number
  totalRequests: number
  conversion: number
  activeBusinesses: number
  updatedAt?: string
}
export interface Settings { publicForms: boolean; showWhatsApp: boolean; darkMode: boolean; autosave: boolean; emailNotifications: boolean; requireApproval: boolean; cookieBanner: boolean; analyticsEnabled: boolean; maintenanceMode: boolean; siteLanguage: 'es' | 'en'; seoTitle: string; seoDescription: string; seoKeywords: string; faviconUrl: string; contactEmail: string; searchIndexing: boolean; currentBusinessId?: string }
export interface Profile { name: string; email: string; role: string }
