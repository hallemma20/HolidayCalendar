// DEV-MOCK: temporary testing aid — delete this file, DevMockTools.tsx and every
// `DEV-MOCK` line in CalendarScreen.tsx when no longer needed. Mock people/events
// exist only in React state: never sent to the API or Cosmos DB, gone on reload.
import { addDays, addHours, startOfDay } from 'date-fns'
import { HOLIDAY_TYPES, type Holiday, type SquadMember } from '../types'

const MOCK_PEOPLE: SquadMember[] = [
  { oid: 'mock-oid-alice', displayName: 'Alice Mock', joinedAt: '' },
  { oid: 'mock-oid-bob', displayName: 'Bob Mock', joinedAt: '' },
  { oid: 'mock-oid-carol', displayName: 'Carol Mock', joinedAt: '' },
  { oid: 'mock-oid-dave', displayName: 'Dave Mock', joinedAt: '' },
]

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Builds a random mock event from a random mock person, near the date being viewed. */
export function makeMockHoliday(groupId: string, viewedDate: Date): Holiday {
  const person = pick(MOCK_PEOPLE)
  const allDay = Math.random() < 0.6
  const start = addDays(startOfDay(viewedDate), Math.floor(Math.random() * 10) - 3)
  const days = allDay ? Math.floor(Math.random() * 3) : 0
  const startTime = allDay ? start : addHours(start, 8 + Math.floor(Math.random() * 6))
  const end = allDay ? addDays(start, days + 1) : addHours(startTime, 1 + Math.floor(Math.random() * 3))
  const now = new Date().toISOString()
  return {
    id: `mock-${crypto.randomUUID()}`,
    groupId,
    oid: person.oid,
    displayName: person.displayName,
    startUtc: startTime.toISOString(),
    endUtc: end.toISOString(),
    allDay,
    type: pick(HOLIDAY_TYPES),
    createdAt: now,
    updatedAt: now,
  }
}

/** The distinct mock people that currently own at least one mock event. */
export function mockMembersFor(mockHolidays: Holiday[]): SquadMember[] {
  return MOCK_PEOPLE.filter((p) => mockHolidays.some((h) => h.oid === p.oid))
}
