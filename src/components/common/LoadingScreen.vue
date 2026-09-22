<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <main class="loading-screen" aria-live="polite" aria-busy="true">
    <div class="loading-mark"><span /><span /><span /></div>
    <strong>UniversalWorks</strong>
    <p>{{ label ?? 'Preparando tu espacio' }}</p>
  </main>
</template>
