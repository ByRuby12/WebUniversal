<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, LogOut } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const props = defineProps<{ section: string }>()
const emit = defineEmits<{ logout: [] }>()
const app = useAppStore(); const notificationsOpen = ref(false); const notificationWrap = ref<HTMLElement | null>(null)
const businessRequests = () => app.requests.filter((request) => request.businessId === app.selectedBusiness.id)
const unread = () => app.settings.emailNotifications ? businessRequests().filter((request) => request.responseStatus === 'pendiente').length : 0
function closeMenus(event: MouseEvent) { const target = event.target as Node; if (!notificationWrap.value?.contains(target)) notificationsOpen.value = false }
function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') notificationsOpen.value = false }
onMounted(() => { document.addEventListener('click', closeMenus); document.addEventListener('keydown', closeOnEscape) })
onBeforeUnmount(() => { document.removeEventListener('click', closeMenus); document.removeEventListener('keydown', closeOnEscape) })
</script>
<template>
  <header class="topbar"><span>UniversalWorks / <b>{{ props.section }}</b></span><div class="topbar-tools"><div ref="notificationWrap" class="notification-wrap"><button class="icon-button" aria-label="Notificaciones" @click.stop="notificationsOpen = !notificationsOpen"><Bell :size="18" /><i v-if="unread()" /></button><div v-if="notificationsOpen" class="notification-popover"><div class="popover-title"><span><Bell :size="15" /> Notificaciones</span><small>{{ unread() }} pendientes</small></div><button v-for="request in businessRequests().slice(0, 4)" :key="request.id" @click="notificationsOpen = false"><span>{{ request.responseStatus === 'pendiente' ? 'Nueva solicitud' : 'Solicitud contestada' }}</span><small>{{ request.name }} · {{ request.type }}</small></button><span v-if="!businessRequests().length" class="empty-notification">No hay notificaciones nuevas.</span></div></div><button class="logout" @click="emit('logout')"><LogOut :size="14" /> Salir</button></div></header>
</template>
