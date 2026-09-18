import { endOfDay, parse, startOfDay } from 'date-fns'
import type { Holiday, NewHolidayInput } from '../types'
import { apiFetch } from './apiClient'

function toIsoDateTime(date: string, time: string): string {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString()
}

function toIsoBoundary(date: string, boundary: 'start' | 'end'): string {
  const parsed = parse(date, 'yyyy-MM-dd', new Date())
  return (boundary === 'start' ? startOfDay(parsed) : endOfDay(parsed)).toISOString()
}

function toHolidayPayload(input: NewHolidayInput) {
  return {
    startUtc: input.allDay ? toIsoBoundary(input.startDate, 'start') : toIsoDateTime(input.startDate, input.startTime!),
    endUtc: input.allDay ? toIsoBoundary(input.endDate, 'end') : toIsoDateTime(input.endDate, input.endTime!),
    allDay: input.allDay,
    type: input.type,
    note: input.note,
  }
}

// mirrors GET /groups/{id}/holidays — caller is derived server-side from the SSO bearer token
export function listHolidays(groupId: string): Promise<Holiday[]> {
  return apiFetch<Holiday[]>(`/groups/${groupId}/holidays`)
}

// mirrors POST /groups/{id}/holidays — owner is derived server-side from the SSO bearer token
export function addHoliday(groupId: string, input: NewHolidayInput): Promise<Holiday> {
  return apiFetch<Holiday>(`/groups/${groupId}/holidays`, {
    method: 'POST',
    body: JSON.stringify(toHolidayPayload(input)),
  })
}

// mirrors PATCH /holidays/{id} — server rejects this unless the caller owns the entry
export function updateHoliday(groupId: string, holidayId: string, input: NewHolidayInput): Promise<Holiday> {
  return apiFetch<Holiday>(`/holidays/${holidayId}`, {
    method: 'PATCH',
    body: JSON.stringify({ groupId, ...toHolidayPayload(input) }),
  })
}

// mirrors DELETE /holidays/{id} — server rejects this unless the caller owns the entry
export function deleteHoliday(groupId: string, holidayId: string): Promise<void> {
  return apiFetch<void>(`/holidays/${holidayId}`, {
    method: 'DELETE',
    body: JSON.stringify({ groupId }),
  })
}
