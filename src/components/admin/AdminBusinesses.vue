<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Check, Image, Link, Plus, Search, Share2, Trash2 } from 'lucide-vue-next'
import { useAdminWorkspace } from '../../composables/useAdminWorkspace'
import { moduleLabels } from '../../data'
import { getModuleRecommendation } from '../../data/moduleRecommendations'
import type { Business, BusinessTranslation, ModuleKey } from '../../types'
import AdminPublicCopy from './AdminPublicCopy.vue'

const workspace = useAdminWorkspace()
const emit = defineEmits<{ saved: [message?: string] }>()
const { app, search, saved, current: currentBusiness, businesses, update: workspaceUpdate, toggleModule, saveCurrentSelection } = workspace
const fallbackBusiness = (): Business => ({
  id: '', name: 'Sin negocio', description: '', category: '', color: '#203b3a', image: '',
  modules: { bookings: false, quotes: false, contact: false, gallery: false, reviews: false, faq: false, social: false, pricing: false, team: false, serviceArea: false },
  phone: '', email: '', address: '', hours: '', about: '', story: '', services: [], process: [], serviceAreas: [],
  gallery: [], faq: [], socialLinks: [], pages: [], reviews: [], bookingSlots: '', bookingIntervalMinutes: 60, blockedDates: [], views: 0, published: false,
  legal: { privacy: '', terms: '', returns: '', support: '' },
})
const editingLanguage = ref<'es' | 'en'>('es')
const safeCurrentBusiness = computed<Business>(() => currentBusiness.value ?? fallbackBusiness())
const current = computed<Business>(() => {
  const base = safeCurrentBusiness.value
  if (!base) return fallbackBusiness()
  if (editingLanguage.value === 'es' || !base.englishEnabled) return base
  return { ...base, ...(base.translations?.en ?? {}), language: 'en' }
})
const localizedKeys = new Set<keyof Business>(['name', 'description', 'category', 'phone', 'email', 'address', 'hours', 'about', 'story', 'services', 'process', 'serviceAreas', 'faq', 'pages', 'legal', 'proofRatingValue', 'proofRatingLabel', 'proofAreasValue', 'proofAreasLabel', 'proofResponseValue', 'proofResponseLabel', 'proofPricingValue', 'proofPricingLabel', 'storyEyebrow', 'storyTitle', 'storyAsideTitle', 'storyAsideText'])
const expanded = ref<'identity' | 'content' | 'links' | 'modules' | 'legal' | null>(null)
let sectionClickTarget: HTMLElement | null = null
function handleSectionClick(event: Event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const toggle = target.closest('.section-toggle')
  if (!toggle) return
  const section = toggle.parentElement
  const container = section?.parentElement
  if (!section || !container) return
  const sectionIndex = Array.from(container.children).indexOf(section)
  if (sectionIndex < 0 || sectionIndex > 4) return
  event.stopPropagation()
  const keys = ['identity', 'content', 'links', 'modules', 'legal'] as const
  expanded.value = expanded.value === keys[sectionIndex] ? null : keys[sectionIndex]
}
onMounted(() => {
  sectionClickTarget = document.querySelector('.business-editor .editor-sections')
  sectionClickTarget?.addEventListener('click', handleSectionClick, true)
})
onBeforeUnmount(() => sectionClickTarget?.removeEventListener('click', handleSectionClick, true))
const page = ref(1)
const pageSize = 12
const newName = ref('Nuevo negocio')
const newDescription = ref('Una experiencia hecha para ti')
const totalPages = computed(() => Math.max(1, Math.ceil(businesses.value.length / pageSize)))
const visibleBusinesses = computed(() => businesses.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const rangeStart = computed(() => businesses.value.length ? (page.value - 1) * pageSize + 1 : 0)
const rangeEnd = computed(() => Math.min(page.value * pageSize, businesses.value.length))
const activeCount = computed(() => Object.values(current.value.modules).filter(Boolean).length)
function lines(value: string) { return value.split('\n').map((item) => item.trim()).filter(Boolean) }
function addBusiness() { app.addBusiness({ ...structuredClone(app.businesses[0]), id: `business-${Date.now()}`, name: newName.value, description: newDescription.value, views: 0, reviews: [] }); newName.value = 'Nuevo negocio'; newDescription.value = 'Una experiencia hecha para ti'; page.value = 1 }
function selectPage(nextPage: number) { page.value = Math.min(Math.max(nextPage, 1), totalPages.value) }
function togglePublished() {
  const target = safeCurrentBusiness.value
  if (!target) return
  const next = !target.published
  const title = next ? 'Publicar este negocio en la web pública' : 'Ocultar este negocio de la web pública'
  const confirmed = window.confirm(`${title}?`)
  if (!confirmed) return
  workspaceUpdate({ published: next })
}
function update(changes: Partial<Business>) {
  if (!safeCurrentBusiness.value) return
  if ('language' in changes) { editingLanguage.value = changes.language ?? 'es'; workspaceUpdate(changes); return }
  if (editingLanguage.value === 'es') {
    workspaceUpdate(changes)
    return
  }

  const localizedChanges = Object.fromEntries(Object.entries(changes).filter(([key]) => localizedKeys.has(key as keyof Business))) as BusinessTranslation
  const baseChanges = Object.fromEntries(Object.entries(changes).filter(([key]) => !localizedKeys.has(key as keyof Business))) as Partial<Business>

  workspaceUpdate({
    ...baseChanges,
    translations: {
      ...safeCurrentBusiness.value.translations,
      en: {
        ...safeCurrentBusiness.value.translations?.en,
        ...localizedChanges,
      },
    },
  })
}
function addSocialLink() { if (!safeCurrentBusiness.value) return; workspaceUpdate({ socialLinks: [...safeCurrentBusiness.value.socialLinks, { name: '', url: '' }] }) }
function updateSocialLink(index: number, changes: Partial<{ name: string; url: string }>) { if (!safeCurrentBusiness.value) return; workspaceUpdate({ socialLinks: safeCurrentBusiness.value.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) }) }
function removeSocialLink(index: number) { if (!safeCurrentBusiness.value) return; workspaceUpdate({ socialLinks: safeCurrentBusiness.value.socialLinks.filter((_, itemIndex) => itemIndex !== index) }) }
function updatePage(index: number, changes: Partial<{ id: string; label: string; title: string; intro: string; body: string; published: boolean }>) {
  update({ pages: current.value.pages.map((page, pageIndex) => pageIndex === index ? { ...page, ...changes } : page) })
}
function recommendation(key: ModuleKey) { return getModuleRecommendation(current.value, key) }
const legalDefaults = { privacy: 'Explica como se usan y protegen los datos que recibe este negocio.', terms: 'Define las condiciones de los servicios, presupuestos y reservas.', returns: 'Indica como se gestionan cancelaciones, cambios y devoluciones.', support: 'Indica como contactar con el negocio y en que horario responde.' }
function legalValue(key: keyof typeof legalDefaults) { return current.value.legal?.[key] || legalDefaults[key] }
function updateLegal(key: keyof typeof legalDefaults, value: string) { update({ legal: { ...legalDefaults, ...current.value.legal, [key]: value } }) }
function toggleEnglish() { if (!safeCurrentBusiness.value) return; const next = !safeCurrentBusiness.value.englishEnabled; workspaceUpdate({ englishEnabled: next, language: next ? 'en' : 'es' }); editingLanguage.value = next ? 'en' : 'es'; }
watch(editingLanguage, (language) => {
  if (safeCurrentBusiness.value.language !== language) workspaceUpdate({ language })
})
async function saveChanges() {
  try {
    await app.persistBusiness(safeCurrentBusiness.value)
    emit('saved', 'El negocio se ha guardado correctamente.')
  } catch (error) {
    console.error('No se pudo guardar el negocio', error)
  }
}
async function saveSelection() {
  await saveCurrentSelection()
  emit('saved', 'El negocio activo se ha guardado correctamente.')
}
</script>

<template>
  <div class="business-workspace">
      <div class="business-toolbar"><label class="search"><Search :size="15" /><input v-model="search" placeholder="Buscar por nombre, categoria o sector..." /></label><span>Mostrando {{ rangeStart }}-{{ rangeEnd }} de {{ businesses.length }}</span><button class="button secondary" type="button" @click="saveSelection">Guardar negocio activo</button><button class="button" @click="addBusiness"><Plus :size="15" /> Nuevo negocio</button></div>
    <div class="business-catalog"><button v-for="business in visibleBusinesses" :key="business.id" class="business-card" :class="{ selected: business.id === current.id }" @click="workspace.selectBusiness(business.id)"><img :src="business.image" :alt="business.name" /><span><strong>{{ business.name }}</strong><small>{{ business.category }}</small></span><Check v-if="business.id === current.id" :size="15" /></button></div>
    <div class="business-pagination"><button class="pagination-button" :disabled="page === 1" aria-label="Pagina anterior" @click="selectPage(page - 1)"><ChevronLeft :size="15" /></button><span>Pagina {{ page }} de {{ totalPages }}</span><button class="pagination-button" :disabled="page === totalPages" aria-label="Pagina siguiente" @click="selectPage(page + 1)"><ChevronRight :size="15" /></button></div>
    <section class="editor business-editor"><div class="editor-heading"><div><span class="eyebrow">EDITOR DEL NEGOCIO</span><h2>{{ current.name }}</h2><p>{{ activeCount }} modulos activos · {{ current.published ? 'Activo' : 'En edición' }}</p></div><div class="editor-heading-actions"><button class="button secondary" @click="togglePublished">{{ current.published ? 'Ocultar web' : 'Publicar web' }}</button><button class="button secondary" @click="saveChanges"><Check v-if="saved" :size="14" /> {{ saved ? 'Guardado' : 'Guardar cambios' }}</button></div></div><div class="content-language-picker"><div><span class="eyebrow">CONTENIDO DEL NEGOCIO</span><strong>Idioma que estás editando</strong><small>Escribe cada texto manualmente en español y en inglés. Redes, imágenes y enlaces son compartidos.</small></div><div class="language-segmented"><button type="button" :class="{ active: editingLanguage === 'es' }" @click="editingLanguage = 'es'">ES · Editar español</button><button type="button" :class="{ active: editingLanguage === 'en' }" @click="if (!currentBusiness.englishEnabled) toggleEnglish(); editingLanguage = 'en'">EN · Edit English</button></div><button type="button" class="toggle small-toggle" :class="{ on: currentBusiness.englishEnabled }" @click="toggleEnglish"><i /></button></div><div class="editor-sections">
      <section><button class="section-toggle" @click="expanded = expanded === 'identity' ? 'content' : 'identity'"><span><Image :size="16" /> Identidad y contacto</span><b>{{ expanded === 'identity' ? '−' : '+' }}</b></button><div v-if="expanded === 'identity'" class="form-grid"><label>Nombre visible<input :value="current.name" @input="update({ name: ($event.target as HTMLInputElement).value })" /></label><label>Categoria<input :value="current.category" @input="update({ category: ($event.target as HTMLInputElement).value })" /></label><label>Frase principal<input :value="current.description" @input="update({ description: ($event.target as HTMLInputElement).value })" /></label><label>Color de marca<input :value="current.color" type="color" @input="update({ color: ($event.target as HTMLInputElement).value })" /></label><label>Telefono<input :value="current.phone" @input="update({ phone: ($event.target as HTMLInputElement).value })" /></label><label>Email<input :value="current.email" type="email" @input="update({ email: ($event.target as HTMLInputElement).value })" /></label><label>Direccion<input :value="current.address" @input="update({ address: ($event.target as HTMLInputElement).value })" /></label><label>Horario<input :value="current.hours" @input="update({ hours: ($event.target as HTMLInputElement).value })" /></label><label class="wide image-url-field">Imagen principal (URL)<input :value="current.image" type="url" placeholder="https://..." @input="update({ image: ($event.target as HTMLInputElement).value })" /><small>Esta imagen aparece en la portada y en el resumen.</small></label><figure v-if="current.image" class="image-preview wide"><img :src="current.image" :alt="`Vista previa de ${current.name}`" /><figcaption>Vista previa de la imagen principal</figcaption></figure></div></section>
      <section><button class="section-toggle" @click="expanded = expanded === 'content' ? 'identity' : 'content'"><span><Link :size="16" /> Textos y contenido</span><b>{{ expanded === 'content' ? '−' : '+' }}</b></button><div v-if="expanded === 'content'" class="form-grid"><label class="wide">Resumen<textarea :value="current.about" rows="3" @input="update({ about: ($event.target as HTMLTextAreaElement).value })" /></label><label class="wide">Historia<textarea :value="current.story" rows="3" @input="update({ story: ($event.target as HTMLTextAreaElement).value })" /></label><label class="wide">Servicios (uno por linea)<textarea :value="current.services.join('\n')" rows="4" @input="update({ services: lines(($event.target as HTMLTextAreaElement).value) })" /></label><label class="wide">Proceso (uno por linea)<textarea :value="current.process.join('\n')" rows="4" @input="update({ process: lines(($event.target as HTMLTextAreaElement).value) })" /></label><label class="wide">Galeria (URL por linea)<textarea :value="current.gallery.join('\n')" rows="4" @input="update({ gallery: lines(($event.target as HTMLTextAreaElement).value) })" /></label><label class="wide">Zonas de servicio<textarea :value="current.serviceAreas.join('\n')" rows="3" @input="update({ serviceAreas: lines(($event.target as HTMLTextAreaElement).value) })" /></label><div class="wide pages-translation-editor"><div class="field-intro"><div><strong>Páginas y subtítulos</strong><small>Estos textos se guardan en el idioma seleccionado. Las imágenes y enlaces siguen compartidos.</small></div></div><div v-for="(page, index) in current.pages" :key="page.id" class="page-translation-row"><strong>{{ page.label || `Página ${index + 1}` }}</strong><input :value="page.label" placeholder="Etiqueta del menú" @input="updatePage(index, { label: ($event.target as HTMLInputElement).value })" /><input :value="page.title" placeholder="Título" @input="updatePage(index, { title: ($event.target as HTMLInputElement).value })" /><textarea :value="page.intro" rows="2" placeholder="Subtítulo" @input="updatePage(index, { intro: ($event.target as HTMLTextAreaElement).value })" /><textarea :value="page.body" rows="3" placeholder="Contenido" @input="updatePage(index, { body: ($event.target as HTMLTextAreaElement).value })" /></div></div></div></section>
      <section><button class="section-toggle" @click="expanded = expanded === 'links' ? 'identity' : 'links'"><span><Share2 :size="16" /> Redes y preguntas frecuentes</span><b>{{ expanded === 'links' ? '−' : '+' }}</b></button><div v-if="expanded === 'links'" class="form-grid"><div class="wide social-editor"><div class="field-intro"><div><strong>Redes sociales</strong><small>Añade las plataformas que quieras mostrar en tu web.</small></div><button class="button secondary compact-button" type="button" @click="addSocialLink"><Plus :size="14" /> Añadir red</button></div><div v-if="current.socialLinks.length" class="social-rows"><div v-for="(social, index) in current.socialLinks" :key="index" class="social-row"><input :value="social.name" placeholder="Instagram, YouTube..." aria-label="Nombre de la red social" @input="updateSocialLink(index, { name: ($event.target as HTMLInputElement).value })" /><input :value="social.url" type="url" placeholder="https://..." aria-label="URL de la red social" @input="updateSocialLink(index, { url: ($event.target as HTMLInputElement).value })" /><button class="icon-action danger" type="button" aria-label="Eliminar red social" @click="removeSocialLink(index)"><Trash2 :size="15" /></button></div></div><p v-else class="field-empty">Todavia no has añadido ninguna red social.</p></div><label class="wide">Preguntas frecuentes (Pregunta | Respuesta)<textarea :value="current.faq.map((item) => `${item.question} | ${item.answer}`).join('\n')" rows="4" @input="update({ faq: lines(($event.target as HTMLTextAreaElement).value).map((line) => { const [question, answer] = line.split('|'); return { question: question?.trim() ?? '', answer: answer?.trim() ?? '' } }) })" /></label></div></section>
      <section><button class="section-toggle" @click="expanded = expanded === 'modules' ? 'identity' : 'modules'"><span><Share2 :size="16" /> Funciones y solicitudes</span><b>{{ expanded === 'modules' ? '−' : '+' }}</b></button><div v-if="expanded === 'modules'" class="module-list"><label class="booking-interval-field">Intervalo entre citas (minutos)<input :value="current.bookingIntervalMinutes ?? 60" type="number" min="1" step="1" @input="update({ bookingIntervalMinutes: Math.max(1, Number(($event.target as HTMLInputElement).value) || 60) })" /><small>Permite horarios como 10:00, 10:30 o 10:40. Se guarda en Firebase con este negocio.</small></label><div v-for="key in Object.keys(moduleLabels) as ModuleKey[]" :key="key"><span><strong>{{ moduleLabels[key] }} <em v-if="recommendation(key).recommended">Recomendado</em></strong><small>{{ recommendation(key).note }}</small></span><button class="toggle" :class="{ on: current.modules[key] }" :aria-label="`${moduleLabels[key]}: ${current.modules[key] ? 'activo' : 'inactivo'}`" @click="toggleModule(key)"><i /></button></div></div></section>
      <section><button class="section-toggle" @click="expanded = expanded === 'legal' ? 'identity' : 'legal'"><span><Link :size="16" /> Politicas y privacidad</span><b>{{ expanded === 'legal' ? '−' : '+' }}</b></button><div v-if="expanded === 'legal'" class="form-grid"><label class="wide">Politica de privacidad<textarea :value="legalValue('privacy')" rows="4" @input="updateLegal('privacy', ($event.target as HTMLTextAreaElement).value)" /></label><label class="wide">Terminos y condiciones<textarea :value="legalValue('terms')" rows="4" @input="updateLegal('terms', ($event.target as HTMLTextAreaElement).value)" /></label><label class="wide">Politica de devoluciones<textarea :value="legalValue('returns')" rows="4" @input="updateLegal('returns', ($event.target as HTMLTextAreaElement).value)" /></label><label class="wide">Politica de soporte<textarea :value="legalValue('support')" rows="4" @input="updateLegal('support', ($event.target as HTMLTextAreaElement).value)" /></label></div></section>
      <AdminPublicCopy :business="current" @update="update" />
    </div></section>
  </div>
</template>
