<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Globe2, Save, Search, ShieldCheck, SlidersHorizontal } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const app = useAppStore()
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
watch(app.settings, () => { if (saveState.value !== 'saving') saveState.value = 'idle' }, { deep: true })

async function save() {
  saveState.value = 'saving'
  try {
    await app.persistSettings()
    saveState.value = 'saved'
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
        <Check v-if="saveState === 'saved'" :size="15" />
        <Save v-else :size="15" />
        {{ saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Cambios guardados' : 'Guardar todos los cambios' }}
      </button>
    </header>

    <p v-if="saveState === 'error'" class="settings-feedback error" role="alert">No se han podido guardar los cambios. Revisa la conexión e inténtalo de nuevo.</p>
    <p v-else-if="saveState === 'saved'" class="settings-feedback success">Todos los ajustes se han guardado correctamente.</p>

    <div class="settings-grid settings-grid-improved">
      <article class="settings-card">
        <div class="settings-icon-heading"><SlidersHorizontal :size="18" /><div><span class="eyebrow">EXPERIENCIA</span><h3>Cómo se ve tu web</h3></div></div>
        <label>Idioma general<select v-model="app.settings.siteLanguage"><option value="es">Español</option><option value="en">English</option></select><small>El idioma de cada negocio se configura por separado en Mis negocios.</small></label>
        <label class="setting"><span>Guardado automático<small>Si está activo, los cambios se guardan solo en Firebase sin pulsar guardar manualmente.</small></span><button class="toggle" :class="{ on: app.settings.autosave }" @click="toggle('autosave')"><i /></button></label>
        <label class="setting"><span>Formularios públicos<small>Permite consultas, reservas y presupuestos.</small></span><button class="toggle" :class="{ on: app.settings.publicForms }" @click="toggle('publicForms')"><i /></button></label>
        <label class="setting"><span>Botón de WhatsApp<small>Enlaza directamente con el teléfono del negocio activo.</small></span><button class="toggle" :class="{ on: app.settings.showWhatsApp }" @click="toggle('showWhatsApp')"><i /></button></label>
        <label class="setting"><span>Modo oscuro<small>Aplica una apariencia oscura al sitio público.</small></span><button class="toggle" :class="{ on: app.settings.darkMode }" @click="toggle('darkMode')"><i /></button></label>
        <label class="setting"><span>Banner de cookies<small>Permite al visitante aceptar y recordar su preferencia.</small></span><button class="toggle" :class="{ on: app.settings.cookieBanner }" @click="toggle('cookieBanner')"><i /></button></label>
      </article>

      <article class="settings-card">
        <div class="settings-icon-heading"><ShieldCheck :size="18" /><div><span class="eyebrow">PUBLICACIÓN</span><h3>Control y seguridad</h3></div></div>
        <label class="setting"><span>Avisos de nuevas solicitudes<small>Muestra las nuevas solicitudes en la bandeja del administrador. No envía correos.</small></span><button class="toggle" :class="{ on: app.settings.emailNotifications }" @click="toggle('emailNotifications')"><i /></button></label>
        <label class="setting"><span>Aprobación manual<small>Los negocios nuevos quedan como borrador hasta publicarlos.</small></span><button class="toggle" :class="{ on: app.settings.requireApproval }" @click="toggle('requireApproval')"><i /></button></label>
        <label class="setting"><span>Modo mantenimiento<small>Oculta la web pública mientras haces cambios.</small></span><button class="toggle" :class="{ on: app.settings.maintenanceMode }" @click="toggle('maintenanceMode')"><i /></button></label>
        <label class="setting"><span>Analítica preparada<small>Registra visitas públicas para las estadísticas del administrador.</small></span><button class="toggle" :class="{ on: app.settings.analyticsEnabled }" @click="toggle('analyticsEnabled')"><i /></button></label>
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
        <label class="setting"><span>Permitir indexación<small>Indica a los buscadores que pueden descubrir el sitio.</small></span><button class="toggle" :class="{ on: app.settings.searchIndexing }" @click="toggle('searchIndexing')"><i /></button></label>
        <div class="seo-preview"><Search :size="16" /><strong>{{ app.settings.seoTitle || 'Marta Ruiz Interiorismo | Diseño de viviendas y espacios boutique' }}</strong><span>{{ app.settings.seoDescription || 'Estudio de arquitectura de interiores especializado en viviendas, locales y proyectos de alta personalización con un enfoque funcional y cálido.' }}</span></div>
      </article>
    </div>
  </div>
</template>
