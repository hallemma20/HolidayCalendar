import { parse } from 'date-fns'
import type { Holiday, NewHolidayInput, SquadMember } from '../types'
import { readJson, writeJson } from './localStorageClient'

const HOLIDAYS_KEY = 'holidayCalendar.holidays.v1'

function readHolidays(): Holiday[] {
  return readJson<Holiday[]>(HOLIDAYS_KEY, [])
}

function writeHolidays(holidays: Holiday[]): void {
  writeJson(HOLIDAYS_KEY, holidays)
}

function toIso(date: string, time: string): string {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString()
}

// mirrors GET /groups/{id}/holidays
export function listHolidays(groupId: string): Holiday[] {
  return readHolidays().filter((h) => h.groupId === groupId)
}

// mirrors POST /groups/{id}/holidays
export function addHoliday(
  groupId: string,
  input: NewHolidayInput,
  owner: SquadMember,
): Holiday {
  const now = new Date().toISOString()
  const holiday: Holiday = {
    id: crypto.randomUUID(),
    groupId,
    oid: owner.oid,
    displayName: owner.displayName,
    startUtc: toIso(input.startDate, input.startTime),
    endUtc: toIso(input.endDate, input.endTime),
    allDay: false,
    type: input.type,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  }
  writeHolidays([...readHolidays(), holiday])
  return holiday
}
