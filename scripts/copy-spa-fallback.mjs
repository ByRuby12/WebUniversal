import { copyFile, mkdir } from 'node:fs/promises'

await Promise.all([
	copyFile('dist/index.html', 'dist/404.html'),
	createRouteEntry('login'),
	createRouteEntry('admin'),
])

async function createRouteEntry(route) {
	await mkdir(`dist/${route}`, { recursive: true })
	await copyFile('dist/index.html', `dist/${route}/index.html`)
}