import { signInWithEmailAndPassword, signOut, updateEmail, updatePassword } from 'firebase/auth'
import { auth, hasFirebaseConfig } from './firebase'

export async function signIn(email: string, password: string): Promise<string> {
  if (!hasFirebaseConfig || !auth) {
    const error = new Error('Firebase no está configurado en esta versión publicada. Revisa los secretos VITE_FIREBASE_* de GitHub Actions.') as Error & { code: string }
    error.code = 'app/firebase-config-missing'
    throw error
  }

  const result = await signInWithEmailAndPassword(auth, email, password)
  console.info('Sesión iniciada correctamente', { uid: result.user.uid, email: result.user.email })
  return result.user.email ?? email
}

export async function signOutCurrentUser() {
  if (hasFirebaseConfig && auth) await signOut(auth)
}

export async function updateAccount(email: string, password?: string) {
  if (!auth?.currentUser) throw new Error('No hay una sesión activa.')
  if (email && email !== auth.currentUser.email) await updateEmail(auth.currentUser, email)
  if (password) await updatePassword(auth.currentUser, password)
}
