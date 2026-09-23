<script setup lang="ts">
import { ref } from 'vue'
import { Globe2 } from 'lucide-vue-next'
import type { Business } from '../../types'

defineProps<{ business: Business }>()
const emit = defineEmits<{ update: [changes: Partial<Business>] }>()
const expanded = ref(false)
function update(key: keyof Business, value: string) { emit('update', { [key]: value }) }
</script>

<template>
  <section class="public-copy-editor editor-section-card">
    <button class="section-toggle" type="button" @click="expanded = !expanded"><span><Globe2 :size="16" /> Textos visibles del cliente</span><b :class="{ rotated: expanded }" /></button>
    <div v-if="expanded" class="public-copy-fields">
      <div class="field-intro">
        <div><strong>Contenido de la vista cliente</strong><small>Edita estos textos en español o inglés. Se guardan con este negocio y se publican al guardar.</small></div>
      </div>
      <div class="form-grid">
      <label>Valoración mostrada<input :value="business.proofRatingValue ?? ''" placeholder="4.9/5" @input="update('proofRatingValue', ($event.target as HTMLInputElement).value)" /></label>
      <label>Texto de valoración<input :value="business.proofRatingLabel ?? ''" placeholder="Valoración de clientes" @input="update('proofRatingLabel', ($event.target as HTMLInputElement).value)" /></label>
      <label>Valor de zonas<input :value="business.proofAreasValue ?? ''" placeholder="3+" @input="update('proofAreasValue', ($event.target as HTMLInputElement).value)" /></label>
      <label>Texto de zonas<input :value="business.proofAreasLabel ?? ''" placeholder="Zonas de servicio" @input="update('proofAreasLabel', ($event.target as HTMLInputElement).value)" /></label>
      <label>Valor de respuesta<input :value="business.proofResponseValue ?? ''" placeholder="48h" @input="update('proofResponseValue', ($event.target as HTMLInputElement).value)" /></label>
      <label>Texto de respuesta<input :value="business.proofResponseLabel ?? ''" placeholder="Respuesta rápida" @input="update('proofResponseLabel', ($event.target as HTMLInputElement).value)" /></label>
      <label>Valor de precios<input :value="business.proofPricingValue ?? ''" placeholder="✓" @input="update('proofPricingValue', ($event.target as HTMLInputElement).value)" /></label>
      <label>Texto de precios<input :value="business.proofPricingLabel ?? ''" placeholder="Precios claros" @input="update('proofPricingLabel', ($event.target as HTMLInputElement).value)" /></label>
      <label class="wide">Etiqueta de Sobre<input :value="business.storyEyebrow ?? ''" placeholder="SOBRE" @input="update('storyEyebrow', ($event.target as HTMLInputElement).value)" /></label>
      <label class="wide">Título de Sobre<input :value="business.storyTitle ?? ''" placeholder="Una forma de trabajar con sentido" @input="update('storyTitle', ($event.target as HTMLInputElement).value)" /></label>
      <label class="wide">Título del bloque destacado<input :value="business.storyAsideTitle ?? ''" placeholder="Trato cercano, resultados reales." @input="update('storyAsideTitle', ($event.target as HTMLInputElement).value)" /></label>
      <label class="wide">Texto del bloque destacado<textarea :value="business.storyAsideText ?? ''" rows="2" placeholder="Te acompañamos desde la primera conversación hasta el último detalle." @input="update('storyAsideText', ($event.target as HTMLTextAreaElement).value)" /></label>
      </div>
    </div>
  </section>
</template>
