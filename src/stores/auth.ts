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
    } catch (caughtError) {
      const firebaseCode = caughtError instanceof Error && 'code' in caughtError
        ? String((caughtError as Error & { code?: unknown }).code)
        : ''
      console.error('No se pudo iniciar sesión', {
        code: firebaseCode || 'unknown',
        message: caughtError instanceof Error ? caughtError.message : String(caughtError),
      })
      error.value = firebaseCode === 'app/firebase-config-missing'
        ? 'Firebase no está configurado en la versión publicada. Revisa los secretos de GitHub Actions y vuelve a ejecutar el despliegue.'
        : firebaseCode === 'auth/invalid-credential' || firebaseCode === 'auth/user-not-found' || firebaseCode === 'auth/wrong-password'
        ? 'El correo o la contraseña no son correctos.'
        : firebaseCode === 'auth/operation-not-allowed'
          ? 'El acceso con correo y contraseña no está activado en Firebase.'
          : firebaseCode === 'auth/network-request-failed'
            ? 'No se pudo conectar con Firebase. Comprueba tu conexión e inténtalo de nuevo.'
            : firebaseCode === 'auth/too-many-requests'
              ? 'Se han bloqueado temporalmente los intentos. Espera unos minutos e inténtalo de nuevo.'
              : 'No se pudo iniciar sesión. Revisa la configuración de Firebase y las credenciales.'
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
