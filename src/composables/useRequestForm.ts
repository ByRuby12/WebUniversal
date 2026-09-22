import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { bookingConflict, buildRequest, emptyRequestDraft, type RequestDraft } from '../services/request.service'
import type { RequestType } from '../types'

export function useRequestForm() {
  const app = useAppStore()
  const requestOpen = ref(false)
  const requestType = ref<RequestType>('consulta')
  const draft = ref<RequestDraft>(emptyRequestDraft())
  const error = ref('')
  const successMessage = ref('')

  function openRequest(type: RequestType) {
    requestType.value = type
    error.value = ''
    successMessage.value = ''
    requestOpen.value = true
  }

  function closeRequest() {
    requestOpen.value = false
    error.value = ''
  }

  async function submitRequest() {
    const name = draft.value.name.trim()
    const phone = draft.value.phone.trim()
    const email = draft.value.email.trim()
    const subject = draft.value.subject.trim()
    const detail = draft.value.detail.trim()

    if (!name || !phone || !email || !subject || !detail) {
      error.value = 'Rellena nombre, teléfono, email, asunto y tu mensaje antes de enviar.'
      return
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      error.value = 'Introduce un email válido para poder contestarte.'
      return
    }

    if (!window.confirm('Al enviar esta solicitud aceptas la política de privacidad y las condiciones del negocio.')) return

    if (requestType.value === 'reserva' && bookingConflict(app.selectedBusiness, app.requests, draft.value)) {
      error.value = 'Ese horario no está disponible. Comprueba la fecha, el horario de apertura y las fechas bloqueadas.'
      return
    }

    const saved = await app.addRequest(buildRequest(requestType.value, app.selectedBusiness.id, draft.value))
    if (!saved) {
      error.value = 'No se ha podido guardar la solicitud. Comprueba la configuración de Firebase.'
      return
    }

    successMessage.value = 'Tu solicitud se ha enviado correctamente. Te responderemos pronto.'
    draft.value = emptyRequestDraft()
    closeRequest()
    window.setTimeout(() => {
      successMessage.value = ''
    }, 4000)
  }

  return { requestOpen, requestType, draft, error, successMessage, openRequest, closeRequest, submitRequest }
}
