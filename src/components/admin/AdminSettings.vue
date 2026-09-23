<script setup lang="ts">
import { ref, watch } from 'vue'
import { Globe2, Save, Search, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const app = useAppStore()
const emit = defineEmits<{ saved: [message?: string] }>()
const saveState = ref<'idle' | 'saving' | 'error'>('idle')
watch(app.settings, () => { if (saveState.value !== 'saving') saveState.value = 'idle' }, { deep: true })

async function save() {
  saveState.value = 'saving'
  try {
    await app.persistSettings()
    saveState.value = 'idle'
    emit('saved', 'Los ajustes se han guardado correctamente.')
  } catch (error) {
    console.error('No se pudieron guardar los ajustes', error)
    saveState.value = 'error'
  }
}

function toggle(key: 'publicForms' | 'showWhatsApp' | 'darkMode' | 'cookieBanner' | 'emailNotifications' | 'requireApproval' | 'maintenanceMode' | 'analyticsEnabled' | 'searchIndexing' | 'autosave') {
  app.settings[key] = !app.settings[key]
}
</script>

<template>
  <div class="settings-page">
    <header class="settings-header">
      <div>
        <span class="eyebrow">CONFIGURACIÓN DEL ESPACIO</span>
        <h2>Ajustes de tu web</h2>
        <p>Controla la experiencia pública, la publicación y los datos de contacto desde un único lugar.</p>
      </div>
      <button class="button settings-save" :disabled="saveState === 'saving'" @click="save">
        <Save :size="15" />
        {{ saveState === 'saving' ? 'Guardando...' : 'Guardar todos los cambios' }}
      </button>
    </header>

    <p v-if="saveState === 'error'" class="settings-feedback error" role="alert">No se han podido guardar los cambios. Revisa la conexión e inténtalo de nuevo.</p>

    <div class="settings-grid settings-grid-improved">
      <article class="settings-card">
        <div class="settings-icon-heading"><SlidersHorizontal :size="18" /><div><span class="eyebrow">EXPERIENCIA</span><h3>Cómo se ve tu web</h3></div></div>
        <label>Idioma general<select v-model="app.settings.siteLanguage"><option value="es">Español</option><option value="en">English</option></select><small>El idioma de cada negocio se configura por separado en Mis negocios.</small></label>
        <label class="setting"><span>Guardado automático<small>Guarda los cambios en Firebase sin pulsar guardar manualmente.</small></span><span class="setting-control"><em>{{ app.settings.autosave ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.autosave }" :aria-pressed="app.settings.autosave" aria-label="Alternar guardado automático" @click="toggle('autosave')"><i /></button></span></label>
        <label class="setting"><span>Formularios públicos<small>Controla consultas, reservas y presupuestos desde la web.</small></span><span class="setting-control"><em>{{ app.settings.publicForms ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.publicForms }" :aria-pressed="app.settings.publicForms" aria-label="Alternar formularios públicos" @click="toggle('publicForms')"><i /></button></span></label>
        <label class="setting"><span>Botón de WhatsApp<small>Muestra un enlace directo al teléfono del negocio activo.</small></span><span class="setting-control"><em>{{ app.settings.showWhatsApp ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.showWhatsApp }" :aria-pressed="app.settings.showWhatsApp" aria-label="Alternar botón de WhatsApp" @click="toggle('showWhatsApp')"><i /></button></span></label>
        <label class="setting"><span>Modo oscuro<small>Aplica una apariencia oscura al sitio público.</small></span><span class="setting-control"><em>{{ app.settings.darkMode ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.darkMode }" :aria-pressed="app.settings.darkMode" aria-label="Alternar modo oscuro" @click="toggle('darkMode')"><i /></button></span></label>
        <label class="setting"><span>Banner de cookies<small>Permite al visitante aceptar y recordar su preferencia.</small></span><span class="setting-control"><em>{{ app.settings.cookieBanner ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.cookieBanner }" :aria-pressed="app.settings.cookieBanner" aria-label="Alternar banner de cookies" @click="toggle('cookieBanner')"><i /></button></span></label>
      </article>

      <article class="settings-card">
        <div class="settings-icon-heading"><ShieldCheck :size="18" /><div><span class="eyebrow">PUBLICACIÓN</span><h3>Control y seguridad</h3></div></div>
        <label class="setting"><span>Avisos en el administrador<small>Activa la campana del panel y muestra las solicitudes pendientes. No envía correos.</small></span><span class="setting-control"><em>{{ app.settings.emailNotifications ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.emailNotifications }" :aria-pressed="app.settings.emailNotifications" aria-label="Alternar avisos de solicitudes" @click="toggle('emailNotifications')"><i /></button></span></label>
        <label class="setting"><span>Aprobación manual<small>Los negocios nuevos se crean como borrador y no aparecen online hasta publicarlos.</small></span><span class="setting-control"><em>{{ app.settings.requireApproval ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.requireApproval }" :aria-pressed="app.settings.requireApproval" aria-label="Alternar aprobación manual" @click="toggle('requireApproval')"><i /></button></span></label>
        <label class="setting"><span>Modo mantenimiento<small>Oculta la web pública mientras haces cambios.</small></span><span class="setting-control"><em>{{ app.settings.maintenanceMode ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.maintenanceMode }" :aria-pressed="app.settings.maintenanceMode" aria-label="Alternar modo mantenimiento" @click="toggle('maintenanceMode')"><i /></button></span></label>
        <label class="setting"><span>Analítica preparada<small>Registra visitas públicas para las estadísticas del administrador.</small></span><span class="setting-control"><em>{{ app.settings.analyticsEnabled ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.analyticsEnabled }" :aria-pressed="app.settings.analyticsEnabled" aria-label="Alternar analítica" @click="toggle('analyticsEnabled')"><i /></button></span></label>
      </article>

      <article class="settings-card settings-card-wide">
        <div class="settings-icon-heading"><Globe2 :size="18" /><div><span class="eyebrow">SEO Y CONTACTO</span><h3>Información de la web</h3></div></div>
        <div class="settings-form-grid">
          <label>Título SEO<input v-model="app.settings.seoTitle" placeholder="Marta Ruiz Interiorismo | Diseño de viviendas y espacios boutique" /></label>
          <label>Email de contacto<input v-model="app.settings.contactEmail" type="email" placeholder="hola@martaruizinteriores.com" /></label>
          <label class="wide">Descripción SEO<textarea v-model="app.settings.seoDescription" rows="3" placeholder="Estudio de arquitectura de interiores especializado en viviendas, locales y proyectos de alta personalización con un enfoque funcional y cálido." /></label>
          <label class="wide">Palabras clave<input v-model="app.settings.seoKeywords" placeholder="arquitectura de interiores, interiorismo, diseño de interiores, reforma de vivienda, estudio de interiores, espacios boutique" /></label>
          <label class="wide">Favicon (URL de imagen)<input v-model="app.settings.faviconUrl" type="url" placeholder="https://.../favicon.png" /><small>Admite PNG, JPG, SVG o ICO. Se aplicará al sitio al guardar y publicar.</small></label>
        </div>
        <label class="setting"><span>Permitir indexación<small>Indica a los buscadores que pueden descubrir el sitio.</small></span><span class="setting-control"><em>{{ app.settings.searchIndexing ? 'Activo' : 'Desactivado' }}</em><button type="button" class="toggle" :class="{ on: app.settings.searchIndexing }" :aria-pressed="app.settings.searchIndexing" aria-label="Alternar indexación" @click="toggle('searchIndexing')"><i /></button></span></label>
        <div class="seo-preview"><Search :size="16" /><strong>{{ app.settings.seoTitle || 'Marta Ruiz Interiorismo | Diseño de viviendas y espacios boutique' }}</strong><span>{{ app.settings.seoDescription || 'Estudio de arquitectura de interiores especializado en viviendas, locales y proyectos de alta personalización con un enfoque funcional y cálido.' }}</span></div>
      </article>
    </div>
  </div>
</template>
