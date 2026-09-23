import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const mode = process.env.MODE ?? 'migrate'
const sourceProjectId = process.env.SOURCE_PROJECT_ID
const sourceUid = process.env.SOURCE_UID
const sourceCredentialsPath = process.env.SOURCE_SERVICE_ACCOUNT_JSON
const targetProjectId = process.env.TARGET_PROJECT_ID
const targetCredentialsPath = process.env.TARGET_SERVICE_ACCOUNT_JSON
const targetEmail = process.env.TARGET_EMAIL
const targetPassword = process.env.TARGET_PASSWORD
const backupJson = process.env.BACKUP_JSON ?? './ruby/workspace.json'
const backupDir = process.env.BACKUP_DIR ?? './ruby'

if (!['backup', 'migrate', 'import'].includes(mode)) throw new Error('MODE debe ser backup, migrate o import')
if (['backup', 'migrate'].includes(mode) && (!sourceProjectId || !sourceUid || !sourceCredentialsPath)) {
  throw new Error('Para MODE=backup o migrate necesitas SOURCE_PROJECT_ID, SOURCE_UID y SOURCE_SERVICE_ACCOUNT_JSON')
}
if (['migrate', 'import'].includes(mode) && (!targetProjectId || !targetCredentialsPath || !targetEmail || !targetPassword)) {
  throw new Error(`Para MODE=${mode} necesitas TARGET_PROJECT_ID, TARGET_SERVICE_ACCOUNT_JSON, TARGET_EMAIL y TARGET_PASSWORD`)
}
if (['migrate', 'import'].includes(mode) && process.env.CONFIRM_MIGRATION !== 'YES') {
  throw new Error('La migracion no se ejecuta sin CONFIRM_MIGRATION=YES')
}

async function loadServiceAccount(filePath) {
  const content = await fs.readFile(path.resolve(filePath), 'utf8')
  return JSON.parse(content)
}

function appFor(name, projectId, credentials) {
  return initializeApp({ credential: cert(credentials), projectId }, name)
}

function jsonSafe(value) {
  if (value instanceof Timestamp) return { _type: 'timestamp', value: value.toDate().toISOString() }
  if (Array.isArray(value)) return value.map(jsonSafe)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonSafe(item)]))
  return value
}

function reviveJson(value) {
  if (Array.isArray(value)) return value.map(reviveJson)
  if (value && typeof value === 'object') {
    if (value._type === 'timestamp') return Timestamp.fromDate(new Date(value.value))
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, reviveJson(item)]))
  }
  return value
}

async function readWorkspace(sourceDb) {
  const userRef = sourceDb.collection('users').doc(sourceUid)
  const userSnapshot = await userRef.get()
  if (!userSnapshot.exists) throw new Error(`No existe users/${sourceUid} en el proyecto origen`)
  const [businesses, requests, metrics, stats, publicBusinesses, publicRequests, publicReviews, siteConfig] = await Promise.all([
    userRef.collection('businesses').get(), userRef.collection('requests').get(), userRef.collection('businessMetrics').get(), userRef.collection('stats').doc('summary').get(),
    sourceDb.collection('publicBusinesses').where('ownerId', '==', sourceUid).get(), sourceDb.collection('publicRequests').where('ownerId', '==', sourceUid).get(), sourceDb.collection('publicReviews').where('ownerId', '==', sourceUid).get(), sourceDb.collection('siteConfig').doc('current').get(),
  ])
  return {
    user: userSnapshot.data(), businesses: businesses.docs.map((item) => ({ id: item.id, data: item.data() })), requests: requests.docs.map((item) => ({ id: item.id, data: item.data() })), metrics: metrics.docs.map((item) => ({ id: item.id, data: item.data() })), stats: stats.exists ? { id: stats.id, data: stats.data() } : null,
    publicBusinesses: publicBusinesses.docs.map((item) => ({ id: item.id, data: item.data() })), publicRequests: publicRequests.docs.map((item) => ({ id: item.id, data: item.data() })), publicReviews: publicReviews.docs.map((item) => ({ id: item.id, data: item.data() })), siteConfig: siteConfig.exists ? { id: siteConfig.id, data: siteConfig.data() } : null,
  }
}

async function writeBackup(workspace) {
  await fs.mkdir(path.resolve(backupDir), { recursive: true })
  await fs.writeFile(path.resolve(backupDir, 'workspace.json'), JSON.stringify(jsonSafe(workspace), null, 2), 'utf8')
  console.log(`Backup escrito en ${path.resolve(backupDir, 'workspace.json')}`)
}

async function readBackup(filePath) {
  const workspace = reviveJson(JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8')))
  if (!workspace?.user || !Array.isArray(workspace.businesses)) throw new Error('El JSON no parece un workspace.json valido')
  return workspace
}

async function migrate(workspace, targetDb, targetAuth) {
  let targetUser
  try {
    targetUser = await targetAuth.getUserByEmail(targetEmail)
    await targetAuth.updateUser(targetUser.uid, { password: targetPassword, displayName: workspace.user.profile?.name ?? targetEmail })
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error
    targetUser = await targetAuth.createUser({ email: targetEmail, password: targetPassword, displayName: workspace.user.profile?.name ?? targetEmail })
  }
  const targetUid = targetUser.uid
  const settings = { ...(workspace.user.settings ?? {}), currentBusinessId: workspace.user.settings?.currentBusinessId }
  const profile = { ...(workspace.user.profile ?? {}), email: targetEmail }
  await targetDb.collection('users').doc(targetUid).set({ ...workspace.user, settings, profile }, { merge: true })
  const writeCollection = async (collectionName, items) => { for (const item of items) await targetDb.collection('users').doc(targetUid).collection(collectionName).doc(item.id).set(item.data, { merge: true }) }
  await writeCollection('businesses', workspace.businesses); await writeCollection('requests', workspace.requests); await writeCollection('businessMetrics', workspace.metrics)
  if (workspace.stats) await targetDb.collection('users').doc(targetUid).collection('stats').doc('summary').set(workspace.stats.data, { merge: true })
  for (const item of workspace.publicBusinesses) await targetDb.collection('publicBusinesses').doc(item.id).set({ ...item.data, ownerId: targetUid }, { merge: true })
  for (const item of workspace.publicRequests) await targetDb.collection('publicRequests').doc(item.id).set({ ...item.data, ownerId: targetUid }, { merge: true })
  for (const item of workspace.publicReviews) await targetDb.collection('publicReviews').doc(item.id).set({ ...item.data, ownerId: targetUid }, { merge: true })
  if (workspace.siteConfig) await targetDb.collection('siteConfig').doc('current').set({ ...workspace.siteConfig.data, ownerId: targetUid }, { merge: true })
  console.log(`Migracion completada. Usuario destino: ${targetUid}`)
}

let workspace
if (mode === 'import') workspace = await readBackup(backupJson)
else {
  const sourceApp = appFor('source', sourceProjectId, await loadServiceAccount(sourceCredentialsPath))
  workspace = await readWorkspace(getFirestore(sourceApp))
  await writeBackup(workspace)
}
if (mode === 'migrate' || mode === 'import') {
  const targetApp = appFor('target', targetProjectId, await loadServiceAccount(targetCredentialsPath))
  await migrate(workspace, getFirestore(targetApp), getAuth(targetApp))
}
console.log('Listo. Las contrasenas no se exportan: la cuenta destino usa TARGET_PASSWORD.')
