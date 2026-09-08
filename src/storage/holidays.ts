import { parse } from 'date-fns'
import type { Holiday, NewHolidayInput, SquadMember } from '../types'
import { apiFetch } from './apiClient'

function toIso(date: string, time: string): string {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString()
}

// mirrors GET /groups/{id}/holidays
export function listHolidays(groupId: string, oid: string): Promise<Holiday[]> {
  return apiFetch<Holiday[]>(`/groups/${groupId}/holidays?oid=${encodeURIComponent(oid)}`)
}

// mirrors POST /groups/{id}/holidays
export function addHoliday(
  groupId: string,
  input: NewHolidayInput,
  owner: SquadMember,
): Promise<Holiday> {
  return apiFetch<Holiday>(`/groups/${groupId}/holidays`, {
    method: 'POST',
    body: JSON.stringify({
      startUtc: toIso(input.startDate, input.startTime),
      endUtc: toIso(input.endDate, input.endTime),
      allDay: false,
      type: input.type,
      note: input.note,
      owner,
    }),
  })
}
