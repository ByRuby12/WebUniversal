<script setup lang="ts">
import { ref } from 'vue'
import { UserRound, Save } from 'lucide-vue-next'
import { useAppStore } from '../../stores/app'
import { updateAccount } from '../../services/auth.service'

const app = useAppStore()
const password = ref('')
const feedback = ref('')
async function save() { feedback.value = ''; try { await updateAccount(app.profile.email, password.value || undefined); await app.persist(); password.value = ''; feedback.value = 'Cambios guardados correctamente.' } catch { feedback.value = 'No se pudo actualizar la cuenta. Firebase puede requerir volver a iniciar sesión.' } }
</script>

<template>
  <div class="settings-page">
    <div class="settings-grid">
      <article class="settings-card wide">
        <div class="settings-icon-heading">
          <UserRound :size="18" />
          <div>
            <span class="eyebrow">CUENTA Y PERFIL</span>
            <h2>Datos del administrador</h2>
          </div>
        </div>

        <label>
          Nombre completo
          <input v-model="app.profile.name" />
        </label>

        <label>
          Correo electrónico
          <input v-model="app.profile.email" type="email" />
        </label>

        <label>
          Nueva contraseña
          <input v-model="password" type="password" minlength="6" placeholder="Dejar vacío para no cambiarla" />
        </label>

        <label>
          Rol visible en UniversalWorks
          <input v-model="app.profile.role" />
        </label>

        <button class="button dark-button" @click="save">
          <Save :size="15" />
          Guardar cambios
        </button>
        <p v-if="feedback" class="settings-feedback" role="status">{{ feedback }}</p>
      </article>
    </div>
  </div>
</template>
