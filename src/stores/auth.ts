import { onAuthStateChanged } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { auth } from '../services/firebase'
import { signIn, signOutCurrentUser } from '../services/auth.service'

const SESSION_TIMEOUT_MS = 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const userEmail = ref<string | null>(null)
  const loading = ref(false)
  const error = ref('')
  let sessionTimer: number | undefined

  const clearSessionTimer = () => {
    if (sessionTimer) {
      window.clearTimeout(sessionTimer)
      sessionTimer = undefined
    }
  }

  const resetSessionTimer = () => {
    if (!auth || !auth.currentUser) return
    clearSessionTimer()
    sessionTimer = window.setTimeout(() => {
      void logout('La sesión ha caducado por seguridad.')
    }, SESSION_TIMEOUT_MS)
  }

  const registerActivity = () => {
    if (auth?.currentUser) {
      resetSessionTimer()
    }
  }

  if (auth) {
    onAuthStateChanged(auth, (user) => {
      userEmail.value = user?.email ?? null
      if (user) {
        resetSessionTimer()
      } else {
        clearSessionTimer()
      }
    })

    const activityEvents = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll']
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, { passive: true })
    })
  }

  const authUserEmail = computed(() => auth?.currentUser?.email ?? userEmail.value ?? null)
  const isAuthenticated = computed(() => Boolean(authUserEmail.value))

  const login = async (email: string, password: string) => {
    loading.value = true; error.value = ''
    try {
      const authenticatedEmail = await signIn(email, password)
      userEmail.value = authenticatedEmail
      resetSessionTimer()
    } catch {
      error.value = 'No se pudo iniciar sesión. Comprueba el correo y la contraseña.'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const logout = async (message = '') => {
    clearSessionTimer()
    try {
      await signOutCurrentUser()
    } catch {
      // se limpia la sesión de Firebase
    }
    userEmail.value = null
    if (message) {
      error.value = message
    }
  }

  return { userEmail, authUserEmail, loading, error, isAuthenticated, login, logout }
})
