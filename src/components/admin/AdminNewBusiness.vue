<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'
const app = useAppStore(); const name = ref('Nuevo negocio'); const description = ref('Una experiencia hecha para ti'); function create() { app.addBusiness({ ...structuredClone(app.businesses[0]), id: `business-${Date.now()}`, name: name.value, description: description.value, views: 0, reviews: [] }); name.value = 'Nuevo negocio'; description.value = 'Una experiencia hecha para ti' }
</script>
<template><button class="button" @click="create"><Plus :size="16" /> Nuevo negocio</button></template>
