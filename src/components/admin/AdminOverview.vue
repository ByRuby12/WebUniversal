<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Eye, Globe2, MessageCircle, Pencil, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'
import { moduleLabels } from '../../data'
const emit = defineEmits<{ businesses: []; publicSite: []; messages: [] }>()
const app = useAppStore()
const business = computed(() => app.selectedBusiness ?? {
  id: '',
  name: 'Sin negocio',
  color: '#4f46e5',
  image: '',
  about: '',
  published: false,
  views: 0,
  modules: {} as Record<string, boolean>,
})
const activeModules = computed(() => Object.keys(moduleLabels).filter((key) => !!business.value?.modules?.[key as keyof typeof moduleLabels]))
const requests = computed(() => app.requests.filter((request) => request.businessId === business.value?.id))
const businessMetric = computed(() => app.metrics[business.value.id] ?? { id: business.value.id, views: Number(business.value.views ?? 0), requests: requests.value.length, conversion: 0, published: business.value.published })
const completion = computed(() => Math.round((activeModules.value.length / Object.keys(moduleLabels).length) * 100))
</script>
<template>
  <div class="metrics overview-metrics"><article class="metric-card"><div class="metric-heading"><Globe2 :size="18" /><small>Web activa</small></div><div class="metric-main"><strong>{{ business.published ? 'Si' : 'No' }}</strong><span class="metric-status" :class="{ active: business.published }">{{ business.published ? 'Publicado' : 'Borrador' }}</span></div><span class="metric-note">Estado de tu web publica</span></article><article class="metric-card"><div class="metric-heading"><Eye :size="18" /><small>Visitas recibidas</small></div><div class="metric-main"><strong>{{ businessMetric.views }}</strong><span class="metric-unit">visitas</span></div><span class="metric-note">Personas que han visto tu web</span></article><article class="metric-card"><div class="metric-heading"><MessageCircle :size="18" /><small>Solicitudes</small></div><div class="metric-main"><strong>{{ businessMetric.requests }}</strong><span class="metric-unit">total</span></div><span class="metric-note">{{ requests.filter((item) => item.responseStatus === 'pendiente').length }} pendientes de respuesta</span></article><article class="metric-card"><div class="metric-heading"><ShieldCheck :size="18" /><small>Modulos activos</small></div><div class="metric-main"><strong>{{ activeModules.length }}/{{ Object.keys(moduleLabels).length }}</strong><span class="metric-unit">activos</span></div><span class="metric-note">Funciones configuradas</span></article></div><section class="summary-dashboard"><div class="summary-hero"><div class="summary-cover" :style="{ backgroundImage: `linear-gradient(90deg, ${business.color}e8, rgba(22,48,48,.25)), url(${business.image})` }"><div><span class="eyebrow">PANEL DE CONTROL</span><h2>{{ business.name }}</h2><p>{{ business.about }}</p><div class="summary-actions"><button class="button light" @click="emit('businesses')"><Pencil :size="15" /> Editar negocio</button><button class="button outline-light" @click="emit('publicSite')"><Eye :size="15" /> Ver sitio publicado</button></div></div><span class="published-badge"><i /> {{ business.published ? 'Publicado' : 'Borrador' }}</span></div><div class="summary-details"><span><Globe2 :size="15" /> {{ business.address }}</span><span><CalendarDays :size="15" /> {{ business.hours }}</span><span><Sparkles :size="15" /> {{ activeModules.length }} funciones activas</span></div></div><div class="summary-lower"><article class="health-card"><span class="eyebrow">SALUD DE TU WEB</span><h3>{{ completion >= 80 ? 'Todo listo para crecer' : 'Aun puedes mejorarla' }}</h3><strong class="health-percent">{{ completion }}%</strong><div class="health-track"><i :style="{ width: `${completion}%`, background: business.color }" /></div><p>Completa el contenido para convertir visitas en oportunidades.</p><button class="text-button" @click="emit('businesses')">Completar configuracion</button></article><article class="activity-card"><span class="eyebrow">ACTIVIDAD RECIENTE</span><h3>Lo que esta pasando</h3><div v-if="requests.length" class="activity-item"><MessageCircle :size="15" /><span><strong>{{ requests[0].name }}</strong><small>{{ requests[0].type }} · {{ requests[0].responseStatus }}</small></span></div><div v-else class="activity-empty"><Sparkles :size="18" /><span><strong>Aun no hay actividad</strong><small>Las solicitudes apareceran aqui.</small></span></div><button class="text-button" @click="emit('messages')">Ver bandeja de entrada</button></article></div></section>
</template>
