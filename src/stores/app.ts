import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { allBusinesses, buildEnglishTranslation } from '../data'
import { sectorContent } from '../data/sectorContent'
import { loadWorkspace, saveBusiness, savePublicRequest, saveWorkspace, saveWorkspaceSettings } from '../services/workspace.service'
import type { Business, BusinessMetric, BusinessTranslation, DashboardStats, Profile, RequestItem, Settings } from '../types'

function normalizeBusinessTranslations(business: Business): Business {
  const baseTranslations = business.translations ?? {}
  const makeTranslation = (source: Partial<Business> | undefined): BusinessTranslation => ({
    name: source?.name,
    description: source?.description,
    category: source?.category,
    phone: source?.phone,
    email: source?.email,
    address: source?.address,
    hours: source?.hours,
    about: source?.about,
    story: source?.story,
    services: source?.services,
    process: source?.process,
    serviceAreas: source?.serviceAreas,
    faq: source?.faq,
    pages: source?.pages,
    legal: source?.legal,
  })

  const looksLikeSpanish = (translation?: BusinessTranslation) => {
    if (!translation) return true
    return Object.values(translation).some((value) => {
      if (typeof value === 'string') return /[áéíóúñ¿¡]/.test(value) || /(servicio|clases|empresa|academia|arquitect|gestoria|asesor|proyecto|presupuesto|reserva|como)/i.test(value)
      if (Array.isArray(value)) return value.some((entry) => typeof entry === 'string' ? /[áéíóúñ¿¡]/.test(entry) || /(servicio|clases|empresa|academia|arquitect|gestoria|asesor|proyecto|presupuesto|reserva|como)/i.test(entry) : false)
      if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).some((entry) => typeof entry === 'string' && (/[áéíóúñ¿¡]/.test(entry) || /(servicio|clases|empresa|academia|arquitect|gestoria|asesor|proyecto|presupuesto|reserva|como)/i.test(entry)))
      return false
    })
  }

  const generatedEnglish = buildEnglishTranslation(business)
  const englishTranslation = looksLikeSpanish(baseTranslations.en) ? generatedEnglish : { ...generatedEnglish, ...baseTranslations.en }

  const normalizedTranslations = {
    ...baseTranslations,
    es: { ...baseTranslations.es, ...makeTranslation(business) },
    en: englishTranslation,
  }

  return {
    ...business,
    englishEnabled: business.englishEnabled ?? false,
    translations: normalizedTranslations,
  }
}

const createDefaultSettings = (): Settings => ({
  publicForms: true,
  showWhatsApp: true,
  darkMode: true,
  autosave: true,
  emailNotifications: true,
  requireApproval: false,
  cookieBanner: true,
  analyticsEnabled: false,
  maintenanceMode: false,
  siteLanguage: 'es',
  seoTitle: 'Marta Ruiz Interiorismo | Diseño de viviendas y espacios boutique',
  seoDescription: 'Estudio de arquitectura de interiores especializado en viviendas, locales y proyectos de alta personalización con un enfoque funcional y cálido.',
  seoKeywords: 'arquitectura de interiores, interiorismo, diseño de interiores, reforma de vivienda, estudio de interiores, espacios boutique',
  faviconUrl: '/logotipo.png',
  contactEmail: 'hola@martaruizinteriores.com',
  searchIndexing: true,
})

const mergeSettings = (incoming?: Partial<Settings>): Settings => {
  const next = createDefaultSettings()
  if (!incoming) return next

  Object.entries(incoming).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof value === 'string' && value.trim() === '') return
    const current = next as unknown as Record<string, unknown>
    current[key] = value
  })

  if (!next.seoTitle || !next.seoDescription || !next.seoKeywords || !next.contactEmail) {
    next.seoTitle = next.seoTitle || 'Marta Ruiz Interiorismo | Diseño de viviendas y espacios boutique'
    next.seoDescription = next.seoDescription || 'Estudio de arquitectura de interiores especializado en viviendas, locales y proyectos de alta personalización con un enfoque funcional y cálido.'
    next.seoKeywords = next.seoKeywords || 'arquitectura de interiores, interiorismo, diseño de interiores, reforma de vivienda, estudio de interiores, espacios boutique'
    next.contactEmail = next.contactEmail || 'hola@martaruizinteriores.com'
  }

  return next
}

export const useAppStore = defineStore('app', () => {
  const businesses = ref<Business[]>(structuredClone(allBusinesses).map(normalizeBusinessTranslations))
  const requests = ref<RequestItem[]>([])
  const metrics = ref<Record<string, BusinessMetric>>({})
  const stats = ref<DashboardStats>({ totalViews: 0, totalRequests: 0, conversion: 0, activeBusinesses: 0 })
  const settings = ref<Settings>({ ...createDefaultSettings(), autosave: false })
  const selectedId = ref<string | null>(businesses.value.find((business) => business.id === settings.value.currentBusinessId)?.id ?? businesses.value.find((business) => business.published)?.id ?? businesses.value[0]?.id ?? null)
  const profile = ref<Profile>({ name: 'Laura Martin', email: 'info@prueba.es', role: 'Administradora' })

  const recalculateMetrics = () => {
    const nextMetrics: Record<string, BusinessMetric> = {}
    let totalViews = 0
    let totalRequests = 0

    businesses.value.forEach((business) => {
      const businessRequests = requests.value.filter((request) => request.businessId === business.id)
      const views = Number(business.views ?? 0)
      const requestCount = businessRequests.length
      totalViews += views
      totalRequests += requestCount
      nextMetrics[business.id] = {
        id: business.id,
        views,
        requests: requestCount,
        conversion: views > 0 ? Number(((requestCount / views) * 100).toFixed(1)) : 0,
        published: business.published,
      }
    })

    stats.value = {
      totalViews,
      totalRequests,
      conversion: totalViews > 0 ? Number(((totalRequests / totalViews) * 100).toFixed(1)) : 0,
      activeBusinesses: businesses.value.filter((business) => business.published).length,
    }

    metrics.value = nextMetrics
  }

  const selectedBusiness = computed(() => businesses.value.find((business) => business.id === settings.value.currentBusinessId) ?? businesses.value.find((business) => business.published) ?? businesses.value[0] ?? null)
  const editorBusiness = computed(() => businesses.value.find((business) => business.id === selectedId.value) ?? selectedBusiness.value ?? businesses.value[0] ?? null)
  const setSelected = (id: string) => {
    if (!id || !businesses.value.some((business) => business.id === id)) return
    selectedId.value = id
    persistIfAutosave()
  }
  const updateBusiness = (changes: Partial<Business>) => {
    businesses.value = businesses.value.map((business) => business.id === selectedId.value ? normalizeBusinessTranslations({ ...business, ...changes }) : business)
    recalculateMetrics()
  }
  const persistIfAutosave = () => {
    recalculateMetrics()
    if (settings.value.autosave) void persist()
  }
  const addBusiness = (business: Business) => {
    const normalized = normalizeBusinessTranslations({
      ...business,
      englishEnabled: false,
      language: 'es',
      translations: { ...business.translations, es: business.translations?.es ?? {}, en: business.translations?.en ?? {} },
      published: settings.value.requireApproval ? false : business.published,
    })
    businesses.value.push(normalized)
    selectedId.value = business.id
    recalculateMetrics()
  }
  const addRequest = async (request: RequestItem) => { const saved = await savePublicRequest(request); if (!saved) return false; requests.value.unshift(request); recalculateMetrics(); return true }
  const updateRequest = (id: number, changes: Partial<RequestItem>) => { requests.value = requests.value.map((request) => request.id === id ? { ...request, ...changes } : request); recalculateMetrics(); persistIfAutosave() }
  const incrementViews = () => {
    if (selectedBusiness.value) {
      selectedBusiness.value.views += 1
      recalculateMetrics()
      persistIfAutosave()
    }
  }
  const hydrate = async () => {
    let remote = await loadWorkspace()
    if (!remote) {
      const initialStats = { totalViews: businesses.value.reduce((sum, business) => sum + Number(business.views ?? 0), 0), totalRequests: requests.value.length, conversion: 0, activeBusinesses: businesses.value.filter((business) => business.published).length }
      await saveWorkspace(settings.value, profile.value, businesses.value, requests.value, metrics.value, initialStats)
      remote = await loadWorkspace()
    }
    if (!remote) return null
    if (remote.businesses.length) businesses.value = remote.businesses.map((business) => {
      const academyContent = sectorContent.academy
      const isGenericAcademy = business.id === 'academy' && business.services?.[0] === 'Servicio principal'
      const normalized = normalizeBusinessTranslations(isGenericAcademy ? { ...business, ...academyContent, modules: { ...business.modules, ...academyContent.modules } } : business)
      return normalized
    })
    requests.value = remote.requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    metrics.value = remote.metrics ?? {}
    stats.value = remote.stats ?? { totalViews: 0, totalRequests: 0, conversion: 0, activeBusinesses: 0 }
    recalculateMetrics()
    if (remote.settings) settings.value = mergeSettings(remote.settings)
    if (remote.profile) profile.value = remote.profile
    if (settings.value.currentBusinessId && businesses.value.some((business) => business.id === settings.value.currentBusinessId)) {
      selectedId.value = settings.value.currentBusinessId
    } else if (businesses.value.length) {
      selectedId.value = businesses.value.find((business) => business.published)?.id ?? businesses.value[0].id
    }
    if (selectedId.value) setSelected(selectedId.value)
    return remote
  }
  let persistPromise: Promise<void | undefined> | null = null

  const persist = () => {
    if (persistPromise) return persistPromise

    const nextStats = { ...stats.value }
    const nextMetrics = { ...metrics.value }
    const normalizedSettings = mergeSettings(settings.value)
    if (JSON.stringify(normalizedSettings) !== JSON.stringify(settings.value)) {
      settings.value = normalizedSettings
    }
    recalculateMetrics()

    persistPromise = saveWorkspace(normalizedSettings, profile.value, businesses.value, requests.value, nextMetrics, { ...stats.value, totalViews: nextStats.totalViews || stats.value.totalViews })
      .then(() => undefined)
      .finally(() => {
        persistPromise = null
      })

    return persistPromise
  }

  const persistSettings = () => saveWorkspaceSettings(settings.value, profile.value, businesses.value)
  const persistBusiness = (business: Business) => {
    settings.value.currentBusinessId = business.id
    return saveBusiness(business, settings.value)
  }

  recalculateMetrics()

  return { businesses, requests, metrics, stats, selectedId, profile, settings, selectedBusiness, editorBusiness, setSelected, updateBusiness, addBusiness, addRequest, updateRequest, incrementViews, hydrate, persist, persistSettings, persistBusiness, persistIfAutosave }
})
