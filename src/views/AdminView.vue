<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminTopbar from '../components/admin/AdminTopbar.vue'
import AdminOverview from '../components/admin/AdminOverview.vue'
import AdminBusinesses from '../components/admin/AdminBusinesses.vue'
import AdminStats from '../components/admin/AdminStats.vue'
import AdminMessages from '../components/admin/AdminMessages.vue'
import AdminReviews from '../components/admin/AdminReviews.vue'
import AdminSettings from '../components/admin/AdminSettings.vue'
import AdminProfile from '../components/admin/AdminProfile.vue'
import AdminSupport from '../components/admin/AdminSupport.vue'
import LoadingScreen from '../components/common/LoadingScreen.vue'
import { useAdminWorkspace } from '../composables/useAdminWorkspace'
import { useAuthStore } from '../stores/auth'
import type { AdminSection } from '../types/navigation'

const router = useRouter(); const auth = useAuthStore(); const workspace = useAdminWorkspace(); const { app, active } = workspace; const section = ref<AdminSection>('resumen'); const hydrated = ref(false); const workspaceError = ref('')
const toast = ref('')
let toastTimer: number | undefined
onMounted(async () => {
  const startedAt = Date.now()
  try {
    await app.hydrate()
    workspaceError.value = ''
  } catch (error) {
    const message = error instanceof Error && error.message.includes('permission')
      ? 'No tienes permisos para cargar este espacio de trabajo. Revisa la sesión de Firebase y las reglas de Firestore.'
      : 'No se pudo cargar el espacio de trabajo.'
    workspaceError.value = message
    console.error('workspace hydration failed', error)
  } finally {
    const elapsed = Date.now() - startedAt
    const remaining = Math.max(0, 3000 - elapsed)
    if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining))
    hydrated.value = true
  }
})
function goTo(sectionName: AdminSection) { section.value = sectionName }
function showToast(message = 'Los cambios se han guardado correctamente.') { toast.value = message; if (toastTimer) window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => { toast.value = '' }, 3600) }
async function logout() { await auth.logout(); await router.replace('/login') }
onBeforeUnmount(() => { if (toastTimer) window.clearTimeout(toastTimer) })
</script>
<template>
  <LoadingScreen v-if="!hydrated" label="Cargando tu espacio de trabajo" />
  <main v-else class="admin-shell"><AdminSidebar :section="section" :business-name="active.name" :business-category="active.category" :business-color="active.color" :profile-name="app.profile.name" :profile-role="app.profile.role" @section="goTo" /><section class="admin-main"><AdminTopbar :section="section" @logout="logout" /><div class="admin-content"><p v-if="workspaceError" class="settings-feedback error" role="alert">{{ workspaceError }}</p><section v-if="section !== 'ajustes'" class="heading"><div><span class="eyebrow">{{ section === 'negocios' ? 'GESTION DE CLIENTES' : section === 'resumen' ? 'ESPACIO DE TRABAJO' : section === 'perfil' ? 'CUENTA Y PERFIL' : 'UNIVERSALWORKS ADMIN' }}</span><h1>{{ section === 'resumen' ? active.name : section === 'negocios' ? 'Mis negocios' : section === 'perfil' ? 'Perfil' : section[0].toUpperCase() + section.slice(1) }}</h1><p>{{ section === 'resumen' ? 'Una vista clara de tu actividad, tu web y tus siguientes oportunidades.' : section === 'perfil' ? 'Actualiza tus datos personales y del rol de administración.' : 'Configura y controla cada parte de tu espacio digital.' }}</p></div><div class="heading-actions"><button v-if="section === 'resumen'" class="button secondary" @click="router.push('/')">Ver sitio cliente</button><button v-if="section === 'negocios'" class="button" @click="goTo('negocios')">Gestionar negocios</button></div></section><AdminOverview v-if="section === 'resumen'" @businesses="goTo('negocios')" @public-site="router.push('/')" @messages="goTo('mensajes')" /><AdminBusinesses v-else-if="section === 'negocios'" @saved="showToast" /><AdminStats v-else-if="section === 'estadisticas'" /><AdminMessages v-else-if="section === 'mensajes'" /><AdminReviews v-else-if="section === 'resenas'" /><AdminSettings v-else-if="section === 'ajustes'" @saved="showToast" /><AdminProfile v-else-if="section === 'perfil'" @saved="showToast" /><AdminSupport v-else /></div></section><Transition name="admin-toast"><aside v-if="toast" class="admin-toast" role="status"><span class="admin-toast-mark">✓</span><span>{{ toast }}</span></aside></Transition></main>
</template>
