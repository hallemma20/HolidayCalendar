import { parse } from 'date-fns'
import type { Holiday, NewHolidayInput } from '../types'
import { apiFetch } from './apiClient'

function toIso(date: string, time: string): string {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString()
}

// mirrors GET /groups/{id}/holidays — caller is derived server-side from the SSO bearer token
export function listHolidays(groupId: string): Promise<Holiday[]> {
  return apiFetch<Holiday[]>(`/groups/${groupId}/holidays`)
}

// mirrors POST /groups/{id}/holidays — owner is derived server-side from the SSO bearer token
export function addHoliday(groupId: string, input: NewHolidayInput): Promise<Holiday> {
  return apiFetch<Holiday>(`/groups/${groupId}/holidays`, {
    method: 'POST',
    body: JSON.stringify({
      startUtc: toIso(input.startDate, input.startTime),
      endUtc: toIso(input.endDate, input.endTime),
      allDay: false,
      type: input.type,
      note: input.note,
    }),
  })
}
