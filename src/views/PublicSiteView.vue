<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Facebook, FileText, Globe2, HeartHandshake, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Share2, ShieldCheck, X, Youtube } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import { useRequestForm } from '../composables/useRequestForm'
import { loadFirstPublicBusiness, loadPublicBusiness, loadPublicBusinessSelection } from '../services/workspace.service'
import type { Business, RequestType } from '../types'

const route = useRoute(); const app = useAppStore(); const publicBusiness = ref<Business | null>(null); const baseBusiness = computed(() => {
  const savedBusiness = app.businesses.find((business) => business.id === app.settings.currentBusinessId && business.published)
  return publicBusiness.value ?? savedBusiness ?? app.businesses.find((business) => business.published) ?? app.selectedBusiness
}); const siteLanguage = computed<'es' | 'en'>(() => (baseBusiness.value.englishEnabled ? (baseBusiness.value.language ?? app.settings.siteLanguage) : 'es')); const business = computed(() => {
  const translation = baseBusiness.value.englishEnabled ? (baseBusiness.value.translations?.[siteLanguage.value] ?? {}) : {}
  return { ...baseBusiness.value, ...Object.fromEntries(Object.entries(translation).filter(([, value]) => value !== undefined)) }
}); const { requestOpen, requestType, draft, error: requestError, successMessage, openRequest, closeRequest, submitRequest } = useRequestForm(() => publicBusiness.value ?? app.selectedBusiness)
const publicMissing = ref(false)
function t(spanish: string, english: string) { return siteLanguage.value === 'en' ? english : spanish }
const contactEmail = computed(() => app.settings.contactEmail || business.value.email)
const whatsappUrl = computed(() => `https://wa.me/${business.value.phone.replace(/\D/g, '')}`)
const isUnavailable = computed(() => publicMissing.value || app.settings.maintenanceMode || !business.value.published)
const pageTitle = computed(() => app.settings.seoTitle || business.value.name)
const pageDescription = computed(() => app.settings.seoDescription || business.value.about)
function setMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) { meta = document.createElement('meta'); meta.name = name; document.head.appendChild(meta) }
  meta.content = content
}
function setProperty(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!meta) { meta = document.createElement('meta'); meta.setAttribute('property', property); document.head.appendChild(meta) }
  meta.content = content
}
function setCanonical(url: string) {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link')
  canonical.rel = 'canonical'; canonical.href = url; document.head.appendChild(canonical)
}
function renderCustomPages() {
  document.querySelectorAll('[data-custom-page]').forEach((section) => section.remove())
  const content = document.querySelector('.public-content')
  if (!content) return
  const reservedIds = new Set(['servicios', 'nosotros', 'trabajos', 'faq', 'resenas', 'contacto'])
  business.value.pages.filter((page) => page.published && page.id !== 'inicio' && !reservedIds.has(page.id)).forEach((page) => {
    const section = document.createElement('section'); section.id = page.id; section.className = 'public-section'; section.dataset.customPage = 'true'
    const eyebrow = document.createElement('span'); eyebrow.className = 'eyebrow'; eyebrow.style.color = business.value.color; eyebrow.textContent = page.label
    const title = document.createElement('h2'); title.textContent = page.title
    const intro = document.createElement('p'); intro.textContent = page.intro
    const body = document.createElement('p'); body.textContent = page.body
    section.append(eyebrow, title, intro, body); content.appendChild(section)
  })
}
function toggleBusinessLanguage() {
  const nextLanguage = siteLanguage.value === 'es' ? 'en' : 'es'
  if (!baseBusiness.value.englishEnabled) {
    if (publicBusiness.value) publicBusiness.value = { ...publicBusiness.value, englishEnabled: true, language: 'en' }
    else app.updateBusiness({ englishEnabled: true, language: 'en' })
    app.settings.siteLanguage = 'en'
    return
  }
  if (publicBusiness.value) publicBusiness.value = { ...publicBusiness.value, language: nextLanguage }
  else app.updateBusiness({ language: nextLanguage })
  app.settings.siteLanguage = nextLanguage
}
type Policy = 'privacy' | 'terms' | 'returns' | 'support'
const policyOpen = ref<Policy | null>(null)
function syncMaintenanceScroll() {
  const locked = isUnavailable.value
  document.body.style.overflow = locked ? 'hidden' : ''
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
watch(isUnavailable, () => {
  syncMaintenanceScroll()
}, { immediate: true })
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
})
const policyTitle = computed(() => ({ privacy: t('Política de privacidad', 'Privacy policy'), terms: t('Términos y condiciones', 'Terms and conditions'), returns: t('Política de devoluciones', 'Returns policy'), support: t('Política de soporte', 'Support policy') })[policyOpen.value ?? 'privacy'])
const policyContent = computed(() => business.value.legal?.[policyOpen.value ?? 'privacy'] || ({ privacy: t(`Tratamos los datos que nos facilitas para responder a tu solicitud, prestar el servicio y mantener la comunicación relacionada con tu consulta.`, `We use the information you provide to respond to your request, provide the service and maintain clear communication related to your enquiry.`), terms: t(`Al enviar una solicitud confirmas que los datos aportados son correctos y que la información recibida es orientativa hasta que ambas partes acuerden el servicio, precio, fechas y condiciones.`, `By sending a request, you confirm that the information provided is correct and that the information received is indicative until both parties agree on the service, price, dates and conditions.`), returns: t(`Si el servicio contratado permite cancelación o devolución, gestionaremos la solicitud de forma individual atendiendo al trabajo realizado, los materiales y las condiciones aceptadas antes de comenzar.`, `If the contracted service allows cancellation or refund, we will manage the request individually according to the work completed, the materials and the conditions accepted before starting.`), support: t(`Para recibir soporte, escribe a ${contactEmail.value} indicando tu nombre, el negocio y el detalle de tu consulta. Responderemos dentro de nuestro horario habitual: ${business.value.hours}.`, `For support, write to ${contactEmail.value} with your name, the business and the details of your enquiry. We will respond during our usual working hours: ${business.value.hours}.`) })[policyOpen.value ?? 'privacy'])
const primaryRequestType = computed<RequestType>(() => business.value.requestMode || (business.value.modules.bookings && !business.value.modules.quotes ? 'reserva' : business.value.modules.quotes && !business.value.modules.bookings ? 'presupuesto' : 'consulta'))
const primaryRequestLabel = computed(() => primaryRequestType.value === 'reserva' ? t('Reservar cita', 'Book a visit') : primaryRequestType.value === 'presupuesto' ? t('Pedir presupuesto', 'Request a quote') : t('Contactar ahora', 'Contact now'))
const contactTitle = computed(() => primaryRequestType.value === 'reserva' ? t('Reserva tu cita', 'Book your visit') : primaryRequestType.value === 'presupuesto' ? t('Pide tu presupuesto', 'Request your quote') : t('Cuéntanos qué necesitas', 'Tell us what you need'))
const contactDescription = computed(() => primaryRequestType.value === 'reserva' ? t('Elige el servicio y dinos cuándo te viene bien. Te confirmaremos la cita.', 'Choose the service and tell us when it suits you. We will confirm the appointment.') : primaryRequestType.value === 'presupuesto' ? t('Cuéntanos lo que necesitas y prepararemos una propuesta adaptada.', 'Tell us what you need and we will prepare a tailored proposal.') : t('Escríbenos y te indicaremos el siguiente paso para tu caso.', 'Write to us and we will tell you the next step for your case.'))
const navigationSections = computed(() => {
  const sections = [{ id: 'inicio', label: t('Inicio', 'Home') }, ...business.value.pages.filter((page) => page.published && page.id !== 'inicio').map((page) => ({ id: page.id, label: page.label }))]
  if (!sections.some((section) => section.id === 'nosotros')) sections.push({ id: 'nosotros', label: t('Nosotros', 'About us') })
  if (business.value.modules.gallery) sections.push({ id: 'trabajos', label: t('Trabajos', 'Work') })
  if (business.value.modules.faq && business.value.faq.length) sections.push({ id: 'faq', label: t('Preguntas', 'FAQs') })
  if (business.value.modules.reviews && business.value.reviews.some((review) => review.approved)) sections.push({ id: 'resenas', label: t('Reseñas', 'Reviews') })
  sections.push({ id: 'contacto', label: t('Contacto', 'Contact') })
  return sections.filter((section, index, all) => all.findIndex((item) => item.id === section.id) === index)
})
const activeSection = ref('inicio')
let sectionObserver: IntersectionObserver | undefined
async function loadSite() {
  const routeBusinessId = route.params.businessId
  publicBusiness.value = null

  const persistedSelection = await loadPublicBusinessSelection()
  const validCurrentBusinessId = app.businesses.find((business) => business.id === app.settings.currentBusinessId && business.published)?.id
  const publicCurrentBusinessId = persistedSelection && app.businesses.some((business) => business.id === persistedSelection && business.published)
    ? persistedSelection
    : null

  const preferredBusinessId = typeof routeBusinessId === 'string'
    ? routeBusinessId
    : publicCurrentBusinessId ?? validCurrentBusinessId ?? null

  let remoteBusiness = null
  if (preferredBusinessId) {
    remoteBusiness = await loadPublicBusiness(preferredBusinessId)
  }

  if (remoteBusiness) {
    publicBusiness.value = remoteBusiness
    publicMissing.value = false
    if (remoteBusiness.publicSettings) app.settings = { ...app.settings, ...remoteBusiness.publicSettings }
  } else {
    const fallbackBusiness = publicCurrentBusinessId ? await loadPublicBusiness(publicCurrentBusinessId) : validCurrentBusinessId ? await loadPublicBusiness(validCurrentBusinessId) : null
    const finalFallback = fallbackBusiness ?? await loadFirstPublicBusiness()
    publicBusiness.value = finalFallback
    publicMissing.value = !finalFallback
    if (finalFallback?.publicSettings) app.settings = { ...app.settings, ...finalFallback.publicSettings }
  }

  document.title = pageTitle.value
  setMeta('description', pageDescription.value)
  setMeta('keywords', app.settings.seoKeywords)
  setMeta('robots', app.settings.searchIndexing ? 'index, follow' : 'noindex, nofollow')
  setProperty('og:title', pageTitle.value); setProperty('og:description', pageDescription.value); setProperty('og:image', business.value.image); setProperty('og:type', 'website'); setProperty('twitter:card', 'summary_large_image'); setCanonical(window.location.href)
  if (app.settings.faviconUrl) { const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link'); favicon.rel = 'icon'; favicon.href = app.settings.faviconUrl; document.head.appendChild(favicon) }
  if (app.settings.analyticsEnabled && !isUnavailable.value) app.incrementViews()
  renderCustomPages()
  if (isUnavailable.value) return
  sectionObserver?.disconnect()
  sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) activeSection.value = entry.target.id }), { rootMargin: '-35% 0px -55% 0px' })
  document.querySelectorAll('.public-site section[id]').forEach((section) => sectionObserver?.observe(section))
}
onMounted(() => { void loadSite() })
watch(() => route.params.businessId, () => { void loadSite() })
watch(pageTitle, (title) => { document.title = title }, { immediate: true })
function scrollToSection(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeSection.value = id }
function socialIcon(name: string) { const normalized = name.toLowerCase(); if (normalized.includes('instagram')) return Instagram; if (normalized.includes('facebook')) return Facebook; if (normalized.includes('youtube')) return Youtube; if (normalized.includes('linkedin')) return Linkedin; if (normalized.includes('whatsapp')) return MessageCircle; return Share2 }
</script>
<template>
  <main class="public-site" :class="{ dark: app.settings.darkMode, 'maintenance-mode': isUnavailable }" :style="{ '--accent': business.color }">
    <div v-if="successMessage" class="success-banner" role="status">{{ successMessage }}</div>
    <section v-if="isUnavailable" class="maintenance-screen"><span class="eyebrow">{{ app.settings.maintenanceMode ? t('MANTENIMIENTO', 'MAINTENANCE') : t('PENDIENTE DE APROBACIÓN', 'PENDING APPROVAL') }}</span><h1>{{ app.settings.maintenanceMode ? t('Volvemos enseguida', 'We will be back soon') : t('Este sitio aún no está publicado', 'This site is not published yet') }}</h1><p>{{ app.settings.maintenanceMode ? t('Estamos haciendo unos ajustes. Visítanos dentro de unos minutos.', 'We are making a few adjustments. Please visit us again in a few minutes.') : t('El negocio está preparando su sitio web.', 'The business is preparing its website.') }}</p></section>
    <template v-else>
    <header class="public-header"><a class="brand-public" href="#inicio" @click.prevent="scrollToSection('inicio')"><b>{{ business.name.split(' ').map((word) => word[0]).join('') }}</b><span>{{ business.name }}</span></a><nav><a v-for="section in navigationSections" :key="section.id" :class="{ active: activeSection === section.id }" :href="`#${section.id}`" @click.prevent="scrollToSection(section.id)">{{ section.label }}</a></nav><div class="header-tools"><div class="header-actions"><button class="language" :aria-label="`Cambiar idioma. Actual: ${siteLanguage}`" :title="`Idioma: ${siteLanguage.toUpperCase()}`" @click="toggleBusinessLanguage"><Globe2 :size="15" /></button><button class="theme-toggle" :aria-label="app.settings.darkMode ? 'Activar modo claro' : 'Activar modo nocturno'" :title="app.settings.darkMode ? 'Modo claro' : 'Modo nocturno'" @click="app.settings.darkMode = !app.settings.darkMode">{{ app.settings.darkMode ? '☀' : '☾' }}</button></div><a v-if="app.settings.showWhatsApp" class="button dark-button" :href="whatsappUrl" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight :size="14" /></a><button v-if="app.settings.publicForms" class="button secondary" @click="openRequest('consulta')">{{ t('Contactar', 'Contact') }} <ArrowUpRight :size="14" /></button></div></header>
    <section id="inicio" class="hero" :style="{ backgroundImage: `linear-gradient(90deg, rgba(12,30,31,.87), rgba(12,30,31,.18)), url(${business.image})` }"><div><span class="kicker">{{ business.category }}</span><h1>{{ business.description }}</h1><p>{{ business.about }}</p><div class="actions"><button v-if="app.settings.publicForms" class="button" :style="{ background: business.color }" @click="openRequest(primaryRequestType)">{{ primaryRequestLabel }} <ArrowUpRight :size="15" /></button><button v-if="app.settings.publicForms && business.modules.bookings && business.modules.quotes" class="button ghost" @click="openRequest('presupuesto')">{{ t('Pedir presupuesto', 'Request a quote') }}</button><button v-else-if="app.settings.publicForms && app.settings.showWhatsApp" class="button ghost" @click="openRequest('consulta')">{{ t('Contactar ahora', 'Contact now') }}</button></div></div></section>
    <section class="proof-strip"><div><strong>{{ business.reviews.some((review) => review.approved) ? '4.9/5' : '100%' }}</strong><span>{{ t('Valoración de clientes', 'Customer rating') }}</span></div><div><strong>{{ business.serviceAreas.length }}+</strong><span>{{ t('Zonas de servicio', 'Service areas') }}</span></div><div><strong>48h</strong><span>{{ t('Respuesta rápida', 'Fast response') }}</span></div><div><strong>✓</strong><span>{{ t('Precios claros', 'Clear pricing') }}</span></div></section>
    <section class="public-content"><section id="servicios" class="public-section"><span class="eyebrow" :style="{ color: business.color }">{{ t('LO QUE HACEMOS', 'WHAT WE DO') }}</span><h2>{{ t('Soluciones pensadas para ti', 'Solutions designed for you') }}</h2><p>{{ business.about }}</p><div class="card-grid"><article v-for="(service, index) in business.services" :key="service" class="service-card"><small :style="{ color: business.color }">0{{ index + 1 }}</small><Check :size="19" :style="{ color: business.color }" /><h3>{{ service }}</h3><p>{{ t('Atención profesional, clara y adaptada a lo que necesitas.', 'Professional, clear service tailored to your needs.') }}</p></article></div></section>
      <section id="nosotros" class="story public-section"><div><span class="eyebrow" :style="{ color: business.color }">{{ t('SOBRE', 'ABOUT') }} {{ business.name.toUpperCase() }}</span><h2>{{ t('Una forma de trabajar con sentido', 'A better way to work with purpose') }}</h2><p>{{ business.story }}</p><button class="text-button" @click="scrollToSection('servicios')">{{ t('Ver servicios', 'View services') }} <ArrowRight :size="15" /></button></div><aside><HeartHandshake :size="27" :style="{ color: business.color }" /><strong>{{ t('Trato cercano, resultados reales.', 'Personal approach, real results.') }}</strong><span>{{ t('Te acompañamos desde la primera conversación hasta el último detalle.', 'We support you from the first conversation to the final detail.') }}</span></aside></section>
      <section v-if="business.modules.gallery" id="trabajos" class="public-section"><span class="eyebrow" :style="{ color: business.color }">{{ t('TRABAJOS E IMÁGENES', 'WORK & IMAGES') }}</span><h2>{{ t('Una muestra de nuestro trabajo', 'A sample of our work') }}</h2><div class="gallery"><figure v-for="(image, index) in business.gallery" :key="`${image}-${index}`"><img :src="image" :alt="`${business.name} - ${t('trabajo', 'project')} ${index + 1}`" /><figcaption><span>0{{ index + 1 }}</span> {{ t('Resultado real', 'Real result') }}</figcaption></figure></div></section>
      <section v-if="business.modules.faq && business.faq.length" id="faq" class="public-section"><span class="eyebrow" :style="{ color: business.color }">FAQ</span><h2>{{ t('Preguntas frecuentes', 'Frequently asked questions') }}</h2><details v-for="item in business.faq" :key="item.question"><summary>{{ item.question }} <ChevronDown :size="16" /></summary><p>{{ item.answer }}</p></details></section>
      <section v-if="business.modules.reviews" id="resenas" class="public-section"><span class="eyebrow" :style="{ color: business.color }">{{ t('RESEÑAS DE CLIENTES', 'CUSTOMER REVIEWS') }}</span><h2>{{ t('Lo que dicen nuestros clientes', 'What our clients say') }}</h2><div class="card-grid"><article v-for="review in business.reviews.filter((review) => review.approved)" :key="review.id" class="review-card"><span class="stars">★★★★★</span><p>“{{ review.text }}”</p><strong>{{ review.name }}</strong></article></div></section>
      <section id="contacto" class="contact-band"><div><span class="eyebrow">{{ business.modules.bookings || business.modules.quotes ? t('EMPIEZA AQUÍ', 'START HERE') : t('CONTACTO DIRECTO', 'DIRECT CONTACT') }}</span><h2>{{ contactTitle }}</h2><p>{{ contactDescription }}</p></div><div v-if="app.settings.publicForms" class="contact-actions"><button class="button" :style="{ background: business.color }" @click="openRequest(primaryRequestType)">{{ primaryRequestLabel }} <ArrowUpRight :size="15" /></button><button v-if="business.modules.bookings && business.modules.quotes" class="button contact-secondary" @click="openRequest('presupuesto')">{{ t('Pedir presupuesto', 'Request a quote') }} <ArrowUpRight :size="15" /></button></div></section>
    </section><footer class="site-footer"><div class="footer-brand"><b>{{ business.name }}</b><p>{{ business.description }}</p><small>{{ t('Un espacio claro para conocer nuestros servicios y contactar con nosotros.', 'A clear place to discover our services and get in touch with us.') }}</small></div><div><span>{{ t('CONTACTO', 'CONTACT') }}</span><a :href="`tel:${business.phone}`"><Phone :size="13" /> {{ business.phone }}</a><a :href="`mailto:${business.email}`"><Mail :size="13" /> {{ business.email }}</a><p><MapPin :size="13" /> {{ business.address }}</p></div><div><span>{{ t('HORARIO Y REDES', 'HOURS & SOCIALS') }}</span><p>{{ business.hours }}</p><div v-if="business.socialLinks.length" class="footer-socials"><a v-for="social in business.socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noreferrer" :aria-label="social.name" :title="social.name"><component :is="socialIcon(social.name)" :size="14" /><span>{{ social.name }}</span></a></div></div><div class="footer-legal"><span>{{ t('INFORMACIÓN', 'INFORMATION') }}</span><button @click="policyOpen = 'privacy'"><ShieldCheck :size="13" /> {{ t('Privacidad', 'Privacy') }}</button><button @click="policyOpen = 'terms'"><FileText :size="13" /> {{ t('Términos y condiciones', 'Terms and conditions') }}</button><button @click="policyOpen = 'returns'"><FileText :size="13" /> {{ t('Devoluciones', 'Returns') }}</button><button @click="policyOpen = 'support'"><HeartHandshake :size="13" /> {{ t('Soporte', 'Support') }}</button></div><div class="footer-bottom"><span>© {{ new Date().getFullYear() }} {{ business.name }}. {{ t('Todos los derechos reservados.', 'All rights reserved.') }}</span><span>{{ t('Diseño y tecnología por Byruby12', 'Design and technology by Byruby12') }}</span></div></footer>
    <div v-if="requestOpen" class="modal-backdrop" @click.self="closeRequest"><form class="modal" @submit.prevent="submitRequest"><button type="button" class="close" @click="closeRequest"><X :size="18" /></button><span class="eyebrow" :style="{ color: business.color }">{{ t('CONTACTO', 'CONTACT') }}</span><h2>{{ requestType === 'reserva' ? t('Solicita tu cita', 'Book your appointment') : requestType === 'presupuesto' ? t('Pide presupuesto', 'Request a quote') : t('Escríbenos', 'Write to us') }}</h2><p>{{ t('Cuéntanos lo necesario y adaptaremos la respuesta a tu tipo de servicio.', 'Tell us what you need and we will tailor the response to your type of service.') }}</p><div class="form-grid"><label>{{ t('Nombre', 'Name') }}<input v-model="draft.name" required /></label><label>{{ t('Teléfono', 'Phone') }}<input v-model="draft.phone" required /></label><label>Email<input v-model="draft.email" type="email" required /></label><label>{{ t('¿Cómo prefieres que te contactemos?', 'How would you like us to contact you?') }}<select v-model="draft.preferredContact"><option>Email</option><option>{{ t('Teléfono', 'Phone') }}</option><option>WhatsApp</option></select></label><label>{{ t('Asunto', 'Subject') }}<input v-model="draft.subject" required /></label><label>{{ t('Servicio o necesidad', 'Service or need') }}<input v-model="draft.service" :placeholder="t('Ej. corte, fuga, reforma...', 'E.g. haircut, leak, renovation...')" /></label><label>{{ t('Zona o localidad', 'Area or location') }}<input v-model="draft.area" :placeholder="t('¿Dónde sería el servicio?', 'Where would the service be?')" /></label><label v-if="requestType !== 'reserva'">{{ t('Presupuesto orientativo', 'Estimated budget') }}<select v-model="draft.budget"><option value="">{{ t('Prefiero comentarlo', 'I prefer to discuss it') }}</option><option>{{ t('Menos de 500 €', 'Under 500 €') }}</option><option>{{ t('500 € - 1.500 €', '500 € - 1,500 €') }}</option><option>{{ t('1.500 € - 5.000 €', '1,500 € - 5,000 €') }}</option><option>{{ t('Más de 5.000 €', 'Over 5,000 €') }}</option></select></label><label v-if="requestType === 'reserva'">{{ t('Fecha', 'Date') }}<input v-model="draft.date" type="date" required /></label><label v-if="requestType === 'reserva'">{{ t('Hora', 'Time') }}<input v-model="draft.time" type="time" required /></label><label class="wide">{{ t('Cuéntanos qué necesitas', 'Tell us what you need') }}<textarea v-model="draft.detail" rows="4" required :placeholder="t('Añade medidas, preferencias, fechas o cualquier detalle útil.', 'Add dimensions, preferences, dates or any useful detail.')" /></label></div><p v-if="requestError" class="request-error" role="alert">{{ requestError }}</p><button class="button" :style="{ background: business.color }" type="submit">Enviar solicitud <ArrowUpRight :size="15" /></button></form></div>
    <div v-if="policyOpen" class="modal-backdrop legal-backdrop" @click.self="policyOpen = null"><article class="modal legal-modal"><button type="button" class="close" @click="policyOpen = null"><X :size="18" /></button><span class="eyebrow" :style="{ color: business.color }">{{ t('INFORMACIÓN LEGAL', 'LEGAL INFORMATION') }}</span><h2>{{ policyTitle }}</h2><p>{{ policyContent }}</p><button class="button" :style="{ background: business.color }" @click="policyOpen = null">{{ t('Cerrar', 'Close') }}</button></article></div>
    </template>
  </main>
</template>
