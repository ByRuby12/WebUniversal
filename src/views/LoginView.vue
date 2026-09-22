<script setup lang="ts">
import { ref } from 'vue'
import { BriefcaseBusiness, Check, LogIn, ShieldCheck } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter(); const auth = useAuthStore(); const email = ref(''); const password = ref(''); const error = ref('')
async function submit() {
  error.value = ''
  try {
    const startedAt = Date.now()
    await auth.login(email.value, password.value)
    const remaining = Math.max(0, 3000 - (Date.now() - startedAt))
    if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining))
    await router.replace('/admin')
  } catch {
    error.value = auth.error
  }
}
</script>
<template>
  <main class="login-page"><section class="login-art"><div class="wordmark"><span><BriefcaseBusiness :size="17" /></span> UniversalWorks<span>.</span></div><div class="login-copy"><small>UNA BASE. INFINITAS POSIBILIDADES.</small><h1>Tu próximo gran sitio empieza aquí.</h1><p>Construye webs profesionales para cualquier negocio con el control siempre en tus manos.</p><div class="proof"><span><Check :size="14" /> 30 sectores listos</span><span><Check :size="14" /> Modulos a tu medida</span></div></div></section><section class="login-panel"><div class="login-box"><span class="eyebrow">PANEL DE ADMINISTRACION</span><h2>Bienvenida de nuevo</h2><p>Accede con tus credenciales de Firebase para entrar al panel.</p><form @submit.prevent="submit"><label>Correo electronico<input v-model="email" type="email" required /></label><label>Contrasena<input v-model="password" type="password" minlength="6" required /></label><p v-if="error" class="error">{{ error }}</p><button class="button" :disabled="auth.loading"><LogIn :size="16" />{{ auth.loading ? 'Entrando...' : 'Entrar al panel' }}</button></form><small class="hint">Usa tu usuario y contraseña reales de Firebase.</small><span class="secure"><ShieldCheck :size="14" /> Acceso protegido para administradores</span></div></section></main>
</template>
