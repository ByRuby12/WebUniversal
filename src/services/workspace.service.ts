import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { auth, db, hasFirebaseConfig } from './firebase'
import type { Business, BusinessMetric, DashboardStats, Profile, RequestItem, Settings } from '../types'

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripUndefined(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, stripUndefined(item)])) as T
  }
  return value
}

const defaultSettings: Settings = {
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
}

function normalizeSettings(settings: Partial<Settings> | undefined): Settings {
  const next = { ...defaultSettings, ...(settings ?? {}) }

  if (!next.seoTitle || !next.seoDescription || !next.seoKeywords || !next.contactEmail) {
    next.seoTitle = next.seoTitle || defaultSettings.seoTitle
    next.seoDescription = next.seoDescription || defaultSettings.seoDescription
    next.seoKeywords = next.seoKeywords || defaultSettings.seoKeywords
    next.contactEmail = next.contactEmail || defaultSettings.contactEmail
  }

  return next
}

function publicBusinessData(business: Business, settings: Settings, ownerId: string) {
  const normalized = normalizeSettings(settings)
  return {
    id: business.id, ownerId, name: business.name, description: business.description, category: business.category,
    color: business.color, image: business.image, modules: business.modules, requestMode: business.requestMode,
    language: business.language, englishEnabled: business.englishEnabled ?? false, phone: business.phone, email: normalized.contactEmail || business.email, address: business.address,
    hours: business.hours, about: business.about, story: business.story, services: business.services,
    process: business.process, serviceAreas: business.serviceAreas, gallery: business.gallery, faq: business.faq,
    socialLinks: business.socialLinks, pages: business.pages.filter((page) => page.published),
    reviews: business.reviews.filter((review) => review.approved), bookingSlots: business.bookingSlots,
    blockedDates: business.blockedDates, published: business.published,
    translations: business.translations,
    publicSettings: { publicForms: normalized.publicForms, showWhatsApp: normalized.showWhatsApp, darkMode: normalized.darkMode, cookieBanner: normalized.cookieBanner, analyticsEnabled: normalized.analyticsEnabled, maintenanceMode: normalized.maintenanceMode, siteLanguage: business.language ?? normalized.siteLanguage, seoTitle: normalized.seoTitle, seoDescription: normalized.seoDescription, seoKeywords: normalized.seoKeywords, faviconUrl: normalized.faviconUrl, contactEmail: normalized.contactEmail, searchIndexing: normalized.searchIndexing },
  }
}

export async function loadWorkspace() {
  const firebaseAuth = auth
  const firestoreDb = db

  if (!hasFirebaseConfig || !firebaseAuth || !firestoreDb) return null

  const currentUser = firebaseAuth.currentUser
  if (!currentUser) return null

  try {
    const user = doc(firestoreDb, 'users', currentUser.uid)
    const [userSnapshot, businessesSnapshot, requestsSnapshot, metricsSnapshot, statsSnapshot] = await Promise.all([
      getDoc(user),
      getDocs(collection(firestoreDb, 'users', currentUser.uid, 'businesses')),
      getDocs(collection(firestoreDb, 'users', currentUser.uid, 'requests')),
      getDocs(collection(firestoreDb, 'users', currentUser.uid, 'businessMetrics')),
      getDoc(doc(firestoreDb, 'users', currentUser.uid, 'stats', 'summary')),
    ])
    let publicRequests: RequestItem[] = []
    try {
      const publicRequestsSnapshot = await getDocs(query(collection(firestoreDb, 'publicRequests'), where('ownerId', '==', currentUser.uid)))
      publicRequests = publicRequestsSnapshot.docs.map((item) => item.data() as RequestItem)
    } catch (error) {
      console.warn('loadWorkspace: no se pudieron leer solicitudes públicas', error)
    }

    const data = userSnapshot.data() ?? {}
    const requestMap = new Map<string, RequestItem>()
    ;[...publicRequests, ...requestsSnapshot.docs.map((item) => item.data() as RequestItem)].forEach((item) => requestMap.set(String(item.id), item))
    const metrics = Object.fromEntries(metricsSnapshot.docs.map((item) => [item.id, item.data() as BusinessMetric]))

    const workspace = {
      settings: data.settings as Settings | undefined,
      profile: data.profile as Profile | undefined,
      businesses: businessesSnapshot.docs.map((item) => item.data() as Business),
      requests: [...requestMap.values()],
      metrics,
      stats: statsSnapshot.exists() ? (statsSnapshot.data() as DashboardStats) : undefined,
    }
    console.info('Firestore workspace cargado', { negocios: workspace.businesses.length, peticiones: workspace.requests.length })
    return workspace
  } catch (error) {
    console.error('loadWorkspace: Firestore permission or data access issue', error)
    return null
  }
}

export async function saveWorkspace(settings: Settings, profile: Profile, businesses: Business[], requests: RequestItem[], metrics: Record<string, BusinessMetric> = {}, stats: DashboardStats = { totalViews: 0, totalRequests: 0, conversion: 0, activeBusinesses: 0 }) {
  const firebaseAuth = auth
  const firestoreDb = db

  if (!hasFirebaseConfig || !firebaseAuth || !firestoreDb) return

  const currentUser = firebaseAuth.currentUser
  if (!currentUser) return

  const normalizedSettings = normalizeSettings(settings)
  const user = doc(firestoreDb, 'users', currentUser.uid)
  const businessMetrics = Object.values(metrics).reduce<Record<string, BusinessMetric>>((acc, metric) => {
    if (metric.id) acc[metric.id] = metric
    return acc
  }, {})

  await setDoc(user, stripUndefined({ settings: normalizedSettings, profile, updatedAt: serverTimestamp() }), { merge: true })
  if (normalizedSettings.currentBusinessId) {
    await setDoc(doc(firestoreDb, 'siteConfig', 'current'), stripUndefined({
      currentBusinessId: normalizedSettings.currentBusinessId,
      ownerId: currentUser.uid,
      updatedAt: serverTimestamp(),
    }), { merge: true })
  }
  await Promise.all([
    ...businesses.flatMap((business) => [
      setDoc(doc(firestoreDb, 'users', currentUser.uid, 'businesses', business.id), stripUndefined(business), { merge: true }),
      setDoc(doc(firestoreDb, 'users', currentUser.uid, 'businessMetrics', business.id), stripUndefined({
        id: business.id,
        views: Number(business.views ?? 0),
        requests: requests.filter((request) => request.businessId === business.id).length,
        conversion: Number(business.views ?? 0) > 0 ? Number(((requests.filter((request) => request.businessId === business.id).length / Number(business.views ?? 0)) * 100).toFixed(1)) : 0,
        published: business.published,
        updatedAt: new Date().toISOString(),
      }), { merge: true }),
      Promise.resolve(),
    ]),
    ...requests.map((request) => setDoc(doc(firestoreDb, 'users', currentUser.uid, 'requests', String(request.id)), stripUndefined(request), { merge: true })),
    setDoc(doc(firestoreDb, 'users', currentUser.uid, 'stats', 'summary'), stripUndefined({
      totalViews: Number(stats.totalViews ?? businesses.reduce((total, business) => total + Number(business.views ?? 0), 0)),
      totalRequests: Number(stats.totalRequests ?? requests.length),
      conversion: Number(stats.conversion ?? (businesses.reduce((total, business) => total + Number(business.views ?? 0), 0) > 0 ? ((requests.length / businesses.reduce((total, business) => total + Number(business.views ?? 0), 0)) * 100) : 0)),
      activeBusinesses: businesses.filter((business) => business.published).length,
      updatedAt: new Date().toISOString(),
    }), { merge: true }),
    ...Object.entries(businessMetrics).map(([businessId, metric]) => setDoc(doc(firestoreDb, 'users', currentUser.uid, 'businessMetrics', businessId), stripUndefined({ ...metric, updatedAt: new Date().toISOString() }), { merge: true })),
  ])

  await syncPublishedBusinesses(normalizedSettings, businesses, currentUser.uid)
}

export async function saveWorkspaceSettings(settings: Settings, profile: Profile) {
  const firebaseAuth = auth
  const firestoreDb = db

  if (!hasFirebaseConfig || !firebaseAuth || !firestoreDb) return

  const currentUser = firebaseAuth.currentUser
  if (!currentUser) return

  await setDoc(doc(firestoreDb, 'users', currentUser.uid), stripUndefined({
    settings: normalizeSettings(settings),
    profile,
    updatedAt: serverTimestamp(),
  }), { merge: true })

}

async function syncPublishedBusinesses(settings: Settings, businesses: Business[], ownerId: string) {
  const firestoreDb = db
  if (!firestoreDb) return
  try {
    await Promise.all(businesses.map((business) => business.published
      ? setDoc(doc(firestoreDb, 'publicBusinesses', business.id), stripUndefined(publicBusinessData(business, settings, ownerId)), { merge: true })
      : deleteDoc(doc(firestoreDb, 'publicBusinesses', business.id))))
  } catch (error) {
    console.error('syncPublishedBusinesses: no se pudo actualizar la copia pública', error)
  }
}

export async function savePublicRequest(request: RequestItem) {
  if (!hasFirebaseConfig || !db) return false

  try {
    const publicBusiness = await getDoc(doc(db, 'publicBusinesses', request.businessId))
    const ownerId = publicBusiness.data()?.ownerId
    if (!publicBusiness.exists() || !publicBusiness.data()?.published || typeof ownerId !== 'string') return false

    const requestData = stripUndefined({ ...request, ownerId })
    await setDoc(doc(db, 'publicRequests', String(request.id)), requestData, { merge: true })
    return true
  } catch (error) {
    console.error('savePublicRequest: Firestore permission or data access issue', error)
    return false
  }
}

export async function loadPublicBusiness(businessId: string) {
  if (!hasFirebaseConfig || !db) return null
  const snapshot = await getDoc(doc(db, 'publicBusinesses', businessId))
  if (!snapshot.exists() || snapshot.data().published !== true) return null
  return snapshot.data() as Business
}

export async function loadFirstPublicBusiness() {
  if (!hasFirebaseConfig || !db) return null
  const snapshot = await getDocs(query(collection(db, 'publicBusinesses'), where('published', '==', true), limit(1)))
  return snapshot.empty ? null : snapshot.docs[0].data() as Business
}

export async function loadPublicBusinessSelection() {
  if (!hasFirebaseConfig || !db) return null
  const snapshot = await getDoc(doc(db, 'siteConfig', 'current'))
  const currentBusinessId = snapshot.data()?.currentBusinessId
  return typeof currentBusinessId === 'string' && currentBusinessId ? currentBusinessId : null
}