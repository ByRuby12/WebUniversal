<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, Check, FileText, HelpCircle, Mail, MessageCircle, Phone } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const app = useAppStore()
const filter = ref<'todos' | 'pendiente' | 'contestado'>('todos')
const selectedId = ref<number | null>(null)
const businessRequests = computed(() => app.requests.filter((request) => request.businessId === app.selectedBusiness.id))
const selected = computed(() => businessRequests.value.find((request) => request.id === selectedId.value))
const visible = computed(() => businessRequests.value.filter((request) => filter.value === 'todos' || request.responseStatus === filter.value))
const pendingCount = computed(() => businessRequests.value.filter((request) => request.responseStatus === 'pendiente').length)
const requestStatuses = ['nueva', 'en estudio', 'confirmada', 'cancelada'] as const
const typeLabels = { reserva: 'Reserva', consulta: 'Pregunta de contacto', presupuesto: 'Presupuesto' } as const

function typeLabel(type: 'reserva' | 'consulta' | 'presupuesto') {
  return typeLabels[type]
}

function typeIcon(type: 'reserva' | 'consulta' | 'presupuesto') {
  return type === 'reserva' ? CalendarDays : type === 'presupuesto' ? FileText : HelpCircle
}

function toggle(item: typeof app.requests[number]) {
  app.updateRequest(item.id, { responseStatus: item.responseStatus === 'contestado' ? 'pendiente' : 'contestado' })
  selectedId.value = item.id
}
</script>

<template>
  <div class="messages-page">
    <div class="message-intro">
      <div><span class="eyebrow">BANDEJA DE ENTRADA</span><h2>Solicitudes de clientes</h2><p>Revisa cada mensaje y marca cuándo ya has respondido.</p></div>
      <div class="message-count"><strong>{{ pendingCount }}</strong><span>pendientes</span></div>
    </div>
    <div class="message-filters">
      <button v-for="item in ['todos', 'pendiente', 'contestado']" :key="item" :class="{ active: filter === item }" @click="filter = item as typeof filter">
        {{ item === 'todos' ? 'Todos' : item === 'pendiente' ? 'Pendientes' : 'Contestados' }}
        <b>{{ item === 'todos' ? businessRequests.length : businessRequests.filter((request) => request.responseStatus === item).length }}</b>
      </button>
    </div>
    <div class="messages-layout">
      <section class="message-list">
        <button v-for="item in visible" :key="item.id" class="message-row message-select" :class="[{ selected: selectedId === item.id }, `message-type-${item.type}`]" @click="selectedId = item.id">
          <span class="message-type-icon"><component :is="typeIcon(item.type)" :size="16" /></span>
          <span class="message-row-copy"><strong>{{ item.name }}</strong><small>{{ typeLabel(item.type) }} · {{ item.subject || 'Sin asunto' }}</small><em>{{ item.detail }}</em></span>
          <span class="status" :class="item.responseStatus">{{ item.responseStatus === 'contestado' ? 'Contestado' : 'Pendiente' }}</span>
        </button>
        <p v-if="!visible.length" class="empty">No hay mensajes con este filtro.</p>
      </section>
      <section v-if="selected" class="message-detail">
        <div class="message-detail-heading"><span class="message-type-icon"><component :is="typeIcon(selected.type)" :size="17" /></span><span><span class="eyebrow">{{ typeLabel(selected.type).toUpperCase() }}</span><small>Solicitud #{{ selected.id }}</small></span><span class="detail-status" :class="selected.responseStatus">{{ selected.responseStatus === 'contestado' ? 'Contestado' : 'Pendiente' }}</span></div>
        <div class="message-detail-title"><h2>{{ selected.subject || 'Solicitud recibida' }}</h2><span>{{ selected.name }}</span></div>
        <div class="message-detail-contact"><a :href="`mailto:${selected.email}`"><Mail :size="14" /> {{ selected.email }}</a><a :href="`tel:${selected.phone}`"><Phone :size="14" /> {{ selected.phone }}</a></div>
        <div class="message-request-copy"><span class="eyebrow">DETALLE DE LA SOLICITUD</span><p>{{ selected.detail }}</p></div>
        <div class="message-facts"><span><strong>Servicio</strong>{{ selected.service || 'No indicado' }}</span><span><strong>Zona</strong>{{ selected.area || 'No indicada' }}</span><span v-if="selected.preferredDate"><strong>Fecha</strong>{{ selected.preferredDate }}{{ selected.preferredTime ? ` · ${selected.preferredTime}` : '' }}</span><span v-if="selected.budget"><strong>Presupuesto</strong>{{ selected.budget }}</span></div>
        <div class="message-management"><div class="message-management-head"><span><strong>Gestionar solicitud</strong><small>Actualiza el seguimiento interno</small></span><button class="button" @click="toggle(selected)"><Check :size="15" /> {{ selected.responseStatus === 'contestado' ? 'Reabrir' : 'Marcar contestada' }}</button></div><label class="message-status-field"><span>Estado de la solicitud</span><select :value="selected.status" @change="app.updateRequest(selected.id, { status: ($event.target as HTMLSelectElement).value as typeof selected.status })"><option v-for="status in requestStatuses" :key="status" :value="status">{{ status }}</option></select></label><label class="message-status-field"><span>Nota interna</span><textarea :value="selected.responseNote ?? ''" rows="2" placeholder="Añade una nota para el equipo..." @input="app.updateRequest(selected.id, { responseNote: ($event.target as HTMLTextAreaElement).value })" /></label></div>
      </section>
      <section v-else class="message-detail message-detail-empty"><MessageCircle :size="30" /><p>Selecciona una solicitud para ver sus datos de contacto.</p></section>
    </div>
  </div>
</template>
