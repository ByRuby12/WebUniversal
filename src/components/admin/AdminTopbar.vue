<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, LogOut, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const props = defineProps<{ section: string }>()
const emit = defineEmits<{ logout: [] }>()
const app = useAppStore(); const notificationsOpen = ref(false); const notificationWrap = ref<HTMLElement | null>(null)
const dismissedKey = 'universalworks-dismissed-notifications'
const dismissed = ref<string[]>([])
const businessRequests = computed(() => app.requests.filter((request) => request.businessId === app.selectedBusiness.id))
const notifications = computed(() => {
  if (!app.settings.emailNotifications) return []
  const requests = businessRequests.value.filter((request) => request.responseStatus === 'pendiente').map((request) => ({ id: `request-${request.id}`, title: 'Nueva solicitud', detail: `${request.name} · ${request.type}` }))
  const reviews = app.selectedBusiness.reviews.filter((review) => !review.approved).map((review) => ({ id: `review-${review.id}`, title: 'Nueva reseña', detail: `${review.name} · ${review.rating}/5 estrellas` }))
  return [...requests, ...reviews].filter((notification) => !dismissed.value.includes(notification.id))
})
const unread = computed(() => notifications.value.length)
function dismissNotification(id: string) {
  dismissed.value = [...dismissed.value, id]
  window.localStorage.setItem(dismissedKey, JSON.stringify(dismissed.value))
}
function closeMenus(event: MouseEvent) { const target = event.target as Node; if (!notificationWrap.value?.contains(target)) notificationsOpen.value = false }
function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') notificationsOpen.value = false }
onMounted(() => { document.addEventListener('click', closeMenus); document.addEventListener('keydown', closeOnEscape); try { dismissed.value = JSON.parse(window.localStorage.getItem(dismissedKey) ?? '[]') } catch { dismissed.value = [] } })
onBeforeUnmount(() => { document.removeEventListener('click', closeMenus); document.removeEventListener('keydown', closeOnEscape) })
</script>
<template>
  <header class="topbar"><span>UniversalWorks / <b>{{ props.section }}</b></span><div class="topbar-tools"><div ref="notificationWrap" class="notification-wrap"><button class="icon-button" aria-label="Avisos de solicitudes" title="Avisos de solicitudes" @click.stop="notificationsOpen = !notificationsOpen"><Bell :size="18" /><i v-if="unread" /></button><div v-if="notificationsOpen" class="notification-popover"><div class="popover-title"><span><Bell :size="15" /> Avisos</span><small>{{ unread }} pendientes</small></div><div v-for="notification in notifications" :key="notification.id" class="notification-item"><button class="notification-content" @click="notificationsOpen = false"><span>{{ notification.title }}</span><small>{{ notification.detail }}</small></button><button class="notification-dismiss" aria-label="Borrar aviso" title="Borrar aviso" @click.stop="dismissNotification(notification.id)"><Trash2 :size="14" /></button></div><span v-if="!notifications.length" class="empty-notification">No hay avisos nuevos.</span></div></div><button class="logout" @click="emit('logout')"><LogOut :size="14" /> Salir</button></div></header>
</template>
