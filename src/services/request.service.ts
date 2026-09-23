import type { Business, RequestItem, RequestType } from '../types'

export interface RequestDraft {
  name: string
  phone: string
  email: string
  subject: string
  detail: string
  service: string
  area: string
  budget: string
  preferredContact: string
  date: string
  time: string
}

export const emptyRequestDraft = (): RequestDraft => ({ name: '', phone: '', email: '', subject: '', detail: '', service: '', area: '', budget: '', preferredContact: 'Email', date: '', time: '' })

export function buildRequest(type: RequestType, businessId: string, draft: RequestDraft): RequestItem {
  return { id: Date.now() * 1000 + Math.floor(Math.random() * 1000), type, businessId, ...draft, preferredDate: draft.date, preferredTime: draft.time, status: 'nueva', responseStatus: 'pendiente', createdAt: new Date().toISOString() }
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null
}

function bookingInterval(business: Business) {
  const interval = Number(business.bookingIntervalMinutes)
  return Number.isFinite(interval) && interval > 0 ? interval : 60
}

function bookingDuration(business: Business, date: string) {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
  const day = dayNames[new Date(`${date}T12:00:00`).getDay()]
  const slot = business.bookingSlots.split('\n').map((line) => line.split('|')).find((parts) => parts[0]?.toLowerCase() === day.toLowerCase())
  const duration = Number(slot?.[2])
  return Number.isFinite(duration) && duration > 0 ? duration : 60
}

export function bookingConflict(business: Business, requests: RequestItem[], draft: RequestDraft) {
  if (!draft.date || !draft.time) return false
  if (business.blockedDates.includes(draft.date)) return true
  const requestedDate = new Date(`${draft.date}T${draft.time}`)
  if (Number.isNaN(requestedDate.getTime()) || requestedDate.getTime() < Date.now()) return true
  const start = toMinutes(draft.time)
  if (start === null) return false
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
  const day = dayNames[new Date(`${draft.date}T12:00:00`).getDay()]
  const slot = business.bookingSlots.split('\n').map((line) => line.split('|')).find((parts) => parts[0]?.toLowerCase() === day.toLowerCase())
  if (!slot?.[1]) return true
  const [slotStart, slotEnd] = slot[1].split('-').map(toMinutes)
  if (slotStart === null || slotEnd === null || start < slotStart) return true
  const duration = bookingDuration(business, draft.date)
  const end = start + duration
  if ((start - slotStart) % bookingInterval(business) !== 0) return true
  if (end > slotEnd) return true
  return requests.some((request) => {
    if (request.businessId !== business.id || request.type !== 'reserva' || request.status === 'cancelada' || request.responseStatus === 'contestado' || request.preferredDate !== draft.date || !request.preferredTime) return false
    const existingStart = toMinutes(request.preferredTime)
    if (existingStart === null) return false
    return start < existingStart + duration && existingStart < end
  })
}
