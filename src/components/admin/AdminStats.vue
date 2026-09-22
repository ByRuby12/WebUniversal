<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, CalendarDays, Eye, Globe2, MessageCircle, TrendingUp } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'

const app = useAppStore()
const totalViews = computed(() => app.stats.totalViews || app.businesses.reduce((total, business) => total + Number(business.views ?? 0), 0))
const totalRequests = computed(() => app.stats.totalRequests || app.requests.length)
const conversion = computed(() => {
  const value = app.stats.conversion ?? (totalViews.value > 0 ? (totalRequests.value / totalViews.value) * 100 : 0)
  return `${Number(value).toFixed(1)}%`
})
const maxViews = computed(() => Math.max(...app.businesses.map((business) => Number(business.views ?? 0)), 1))
const ranking = computed(() =>
  app.businesses
    .slice()
    .sort((a, b) => (app.metrics[b.id]?.views ?? Number(b.views ?? 0)) - (app.metrics[a.id]?.views ?? Number(a.views ?? 0)))
    .slice(0, 8),
)
</script>

<template>
  <div class="stats-page">
    <section class="stats-hero stats-hero-rich">
      <div>
        <span class="eyebrow">RENDIMIENTO GLOBAL</span>
        <h2>{{ totalViews.toLocaleString('es-ES') }}</h2>
        <p>visitas acumuladas en tus webs publicadas</p>
      </div>
      <BarChart3 :size="62" />
    </section>

    <div class="metrics stats-kpis">
      <article>
        <Eye :size="18" />
        <small>Visitas</small>
        <strong>{{ totalViews }}</strong>
        <span>Todos los negocios</span>
      </article>
      <article>
        <MessageCircle :size="18" />
        <small>Solicitudes</small>
        <strong>{{ totalRequests }}</strong>
        <span>Entradas reales</span>
      </article>
      <article>
        <TrendingUp :size="18" />
        <small>Conversion</small>
        <strong>{{ conversion }}</strong>
        <span>Visita a solicitud</span>
      </article>
      <article>
        <Globe2 :size="18" />
        <small>Webs activas</small>
        <strong>{{ app.stats.activeBusinesses || app.businesses.filter((business) => business.published).length }}</strong>
        <span>Publicadas</span>
      </article>
    </div>

    <div class="stats-columns">
      <section class="data-panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">COMPARATIVA</span>
            <h3>Rendimiento por negocio</h3>
          </div>
          <Eye :size="17" />
        </div>

        <div v-for="business in ranking" :key="business.id" class="bar-row">
          <div>
            <span>{{ business.name }}</span>
            <strong>{{ app.metrics[business.id]?.views ?? Number(business.views ?? 0) }}</strong>
          </div>
          <span class="bar-track">
            <i :style="{ width: `${((app.metrics[business.id]?.views ?? Number(business.views ?? 0)) / maxViews) * 100}%`, background: business.color }" />
          </span>
        </div>
      </section>

      <section class="data-panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">SOLICITUDES</span>
            <h3>Canales de entrada</h3>
          </div>
          <MessageCircle :size="17" />
        </div>

        <div class="channel-stat">
          <span><CalendarDays :size="16" /> Reservas</span>
          <strong>{{ app.requests.filter((item) => item.type === 'reserva').length }}</strong>
        </div>
        <div class="channel-stat">
          <span><MessageCircle :size="16" /> Consultas</span>
          <strong>{{ app.requests.filter((item) => item.type === 'consulta').length }}</strong>
        </div>
        <div class="channel-stat">
          <span><Globe2 :size="16" /> Presupuestos</span>
          <strong>{{ app.requests.filter((item) => item.type === 'presupuesto').length }}</strong>
        </div>
      </section>
    </div>
  </div>
</template>
