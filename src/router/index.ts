import { createRouter, createWebHashHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import PublicSiteView from '../views/PublicSiteView.vue'

export const router = createRouter({ history: createWebHashHistory(import.meta.env.BASE_URL), routes: [
  { path: '/', component: PublicSiteView, meta: { page: 'client' } },
  { path: '/site/:businessId', component: PublicSiteView, meta: { page: 'client' } },
  { path: '/login', component: LoginView, meta: { page: 'login' } },
  { path: '/admin', component: AdminView, meta: { page: 'admin', requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
] })

const firebaseAuth = auth
const authReady = firebaseAuth
  ? new Promise<void>((resolve) => {
      let unsubscribe: () => void
  unsubscribe = onAuthStateChanged(firebaseAuth, () => {
        unsubscribe()
        resolve()
      })
    })
  : Promise.resolve()

router.beforeEach(async (to) => {
  await authReady
  const loggedIn = Boolean(auth?.currentUser)

  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login', replace: true }
  }

  if (to.meta.page === 'login' && loggedIn) {
    return { path: '/admin', replace: true }
  }
})
