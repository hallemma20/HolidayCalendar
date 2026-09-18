import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { dateFnsLocalizer } from 'react-big-calendar'
import { HOLIDAY_TYPE_SLUG } from '../holidayTypeStyles'
import type { Holiday } from '../types'

export const localizer = dateFnsLocalizer({
  format,
  parse,
  // Mon–Sun weeks (enUS defaults to Sun-first) to match the app's calendar layout.
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS, weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
})

export interface CalendarEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Holiday
}

export function mapHolidayToEvent(holiday: Holiday): CalendarEvent {
  return {
    title: `${holiday.type} · ${holiday.displayName}`,
    start: new Date(holiday.startUtc),
    end: new Date(holiday.endUtc),
    allDay: holiday.allDay,
    resource: holiday,
  }
}

export function eventPropGetter(event: CalendarEvent): { className: string } {
  return { className: `holiday-event holiday-event--${HOLIDAY_TYPE_SLUG[event.resource.type]}` }
}
