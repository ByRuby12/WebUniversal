import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const requiredEnv = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'] as const
const publicFirebaseConfig = {
  apiKey: 'AIzaSyBil6EnGK6BQROeNJv1dVn369pnFfmh5qA',
  authDomain: 'prueba-universal-b6eb6.firebaseapp.com',
  projectId: 'prueba-universal-b6eb6',
  storageBucket: 'prueba-universal-b6eb6.firebasestorage.app',
  messagingSenderId: '347682660762',
  appId: '1:347682660762:web:4ae19f24b7424e78b11a23',
}

export const hasFirebaseConfig = requiredEnv.every((key) => Boolean(import.meta.env[key] || publicFirebaseConfig[envKeyToConfigKey(key)]))

function envKeyToConfigKey(key: typeof requiredEnv[number]) {
  return {
    VITE_FIREBASE_API_KEY: 'apiKey',
    VITE_FIREBASE_AUTH_DOMAIN: 'authDomain',
    VITE_FIREBASE_PROJECT_ID: 'projectId',
    VITE_FIREBASE_STORAGE_BUCKET: 'storageBucket',
    VITE_FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
    VITE_FIREBASE_APP_ID: 'appId',
  }[key] as keyof typeof publicFirebaseConfig
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || publicFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || publicFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || publicFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || publicFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || publicFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || publicFirebaseConfig.appId,
}

export const firebaseApp = hasFirebaseConfig ? initializeApp(config) : null
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const db = firebaseApp ? getFirestore(firebaseApp) : null
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ?? ''
export const appCheck = (() => {
  if (!firebaseApp || !appCheckSiteKey) return null
  try {
    return initializeAppCheck(firebaseApp, { provider: new ReCaptchaV3Provider(appCheckSiteKey), isTokenAutoRefreshEnabled: true })
  } catch {
    return null
  }
})()
