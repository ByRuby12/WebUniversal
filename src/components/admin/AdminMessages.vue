<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Mail, MessageCircle, Phone } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const app = useAppStore()
const filter = ref<'todos' | 'pendiente' | 'contestado'>('todos')
const selectedId = ref<number | null>(null)
const businessRequests = computed(() => app.requests.filter((request) => request.businessId === app.selectedBusiness.id))
const selected = computed(() => businessRequests.value.find((request) => request.id === selectedId.value))
const visible = computed(() => businessRequests.value.filter((request) => filter.value === 'todos' || request.responseStatus === filter.value))
const pendingCount = computed(() => businessRequests.value.filter((request) => request.responseStatus === 'pendiente').length)
const requestStatuses = ['nueva', 'en estudio', 'confirmada', 'cancelada'] as const

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
        <button v-for="item in visible" :key="item.id" class="message-row message-select" :class="{ selected: selectedId === item.id }" @click="selectedId = item.id">
          <span class="type">{{ item.type }}</span>
          <span><strong>{{ item.name }}</strong><small>{{ item.email }} · {{ item.detail }}</small></span>
          <span class="status" :class="item.responseStatus">{{ item.responseStatus === 'contestado' ? 'Contestado' : 'Pendiente' }}</span>
        </button>
        <p v-if="!visible.length" class="empty">No hay mensajes con este filtro.</p>
      </section>
      <section v-if="selected" class="message-detail">
        <span class="eyebrow">{{ selected.type.toUpperCase() }}</span>
        <h2>{{ selected.subject || 'Solicitud recibida' }}</h2>
        <span class="detail-status" :class="selected.responseStatus">{{ selected.responseStatus === 'contestado' ? 'Contestado' : 'Pendiente de respuesta' }}</span>
        <p>{{ selected.detail }}</p>
        <div class="contact-lines">
          <a :href="`mailto:${selected.email}`"><Mail :size="14" /> {{ selected.email }}</a>
          <a :href="`tel:${selected.phone}`"><Phone :size="14" /> {{ selected.phone }}</a>
        </div>
        <label class="message-status-field">Estado<select :value="selected.status" @change="app.updateRequest(selected.id, { status: ($event.target as HTMLSelectElement).value as typeof selected.status })"><option v-for="status in requestStatuses" :key="status" :value="status">{{ status }}</option></select></label>
        <label class="message-status-field">Nota interna<textarea :value="selected.responseNote ?? ''" rows="3" placeholder="Añade una nota para el equipo..." @input="app.updateRequest(selected.id, { responseNote: ($event.target as HTMLTextAreaElement).value })" /></label>
        <button class="button" @click="toggle(selected)"><Check :size="15" /> {{ selected.responseStatus === 'contestado' ? 'Marcar como pendiente' : 'Marcar como contestado' }}</button>
      </section>
      <section v-else class="message-detail message-detail-empty"><MessageCircle :size="30" /><p>Selecciona una solicitud para ver sus datos de contacto.</p></section>
    </div>
  </div>
</template>
