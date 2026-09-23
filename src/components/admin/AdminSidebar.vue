<script setup lang="ts">
import { ref } from 'vue'
import { BarChart3, BriefcaseBusiness, CircleHelp, LayoutDashboard, MessageCircle, PanelLeftClose, PanelLeftOpen, Quote, Settings2, UserRound } from 'lucide-vue-next'
import type { AdminSection } from '../../types/navigation'

const props = defineProps<{ section: AdminSection; businessName: string; businessCategory: string; businessColor: string; profileName: string; profileRole: string }>()
const emit = defineEmits<{ section: [value: AdminSection] }>()
const collapsed = ref(false)
const items = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'negocios', label: 'Mis negocios', icon: BriefcaseBusiness },
  { id: 'estadisticas', label: 'Estadisticas', icon: BarChart3 },
  { id: 'mensajes', label: 'Mensajes', icon: MessageCircle },
  { id: 'resenas', label: 'Resenas', icon: Quote },
  { id: 'ajustes', label: 'Ajustes', icon: Settings2 },
  { id: 'perfil', label: 'Perfil', icon: UserRound },
  { id: 'soporte', label: 'Soporte tecnico', icon: CircleHelp },
] as const
function toggle() { collapsed.value = !collapsed.value }
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar-is-collapsed': collapsed }">
    <div class="sidebar-brand"><div class="wordmark"><span><BriefcaseBusiness :size="16" /></span><strong>UniversalWorks</strong></div><button class="sidebar-menu-toggle" :aria-label="collapsed ? 'Abrir barra lateral' : 'Cerrar barra lateral'" :title="collapsed ? 'Abrir barra lateral' : 'Cerrar barra lateral'" @click="toggle"><PanelLeftOpen v-if="collapsed" :size="18" /><PanelLeftClose v-else :size="18" /></button></div>
    <small class="side-label">NEGOCIO ACTUAL</small>
    <button class="current-business" :title="collapsed ? `${props.businessName} · ${props.businessCategory}` : undefined" @click="emit('section', 'negocios')"><b :style="{ background: props.businessColor }">{{ props.businessName.slice(0, 2).toUpperCase() }}</b><span><strong>{{ props.businessName }}</strong><small>{{ props.businessCategory }}</small></span></button>
    <nav><button v-for="item in items" :key="item.id" :class="{ active: props.section === item.id }" :title="collapsed ? item.label : undefined" @click="emit('section', item.id)"><component :is="item.icon" :size="17" /><span>{{ item.label }}</span></button></nav>
    <button class="profile-link" @click="emit('section', 'perfil')"><span>{{ props.profileName.split(' ').map((part) => part[0]).join('') }}</span><strong>{{ props.profileName }}</strong><small>{{ props.profileRole }}</small></button>
  </aside>
</template>
