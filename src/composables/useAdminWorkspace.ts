import { computed, ref } from 'vue'
import { createBusiness, moduleLabels } from '../data'
import { useAppStore } from '../stores/app'
import type { Business, ModuleKey, RequestItem } from '../types'

export function useAdminWorkspace() {
  const app = useAppStore()
  const search = ref('')
  const saved = ref(false)
  const responseFilter = ref<'todos' | 'pendiente' | 'contestado'>('todos')
  const newName = ref('Nuevo negocio')
  const newDescription = ref('Una experiencia hecha para ti')
  const current = computed(() => app.editorBusiness)
  const active = computed(() => app.selectedBusiness)
  const activeModules = computed(() => Object.keys(moduleLabels).filter((key) => current.value.modules[key as ModuleKey]))
  const businesses = computed(() => app.businesses.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.value.toLowerCase())))
  const requests = computed(() => app.requests.filter((item) => responseFilter.value === 'todos' || item.responseStatus === responseFilter.value))
  function update(changes: Partial<Business>) { app.updateBusiness(changes); saved.value = false; if (app.settings.autosave) window.setTimeout(() => { saved.value = true }, 150) }
  function toggleModule(key: ModuleKey) { update({ modules: { ...current.value.modules, [key]: !current.value.modules[key] } }) }
  function selectBusiness(id: string) { app.setSelected(id); saved.value = false }
  function saveCurrentSelection() {
    if (!current.value) return
    app.settings.currentBusinessId = current.value.id
    void app.persist()
    saved.value = true
  }
  function applyBusiness(id: string) {
    app.setSelected(id)
    if (!app.settings.autosave) {
      void app.persist()
    }
    saved.value = true
  }
  function addBusiness() { app.addBusiness(createBusiness(app.businesses[0], newName.value, newDescription.value)) }
  function toggleResponse(item: RequestItem) { app.updateRequest(item.id, { responseStatus: item.responseStatus === 'contestado' ? 'pendiente' : 'contestado' }) }
  return { app, search, saved, responseFilter, current, active, activeModules, businesses, requests, update, toggleModule, selectBusiness, saveCurrentSelection, applyBusiness, addBusiness, toggleResponse, moduleLabels }
}
