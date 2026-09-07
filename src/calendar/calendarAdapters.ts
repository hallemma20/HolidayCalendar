import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { dateFnsLocalizer } from 'react-big-calendar'
import type { Holiday, HolidayType } from '../types'

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { 'en-US': enUS },
})

export interface CalendarEvent {
  title: string
  start: Date
  end: Date
  resource: Holiday
}

export function mapHolidayToEvent(holiday: Holiday): CalendarEvent {
  return {
    title: `${holiday.displayName} · ${holiday.type}`,
    start: new Date(holiday.startUtc),
    end: new Date(holiday.endUtc),
    resource: holiday,
  }
}

const TYPE_CLASS: Record<HolidayType, string> = {
  'Annual Leave': 'annual',
  'Private Appointment': 'appointment',
  TOIL: 'toil',
  Wellbeing: 'wellbeing',
  Absence: 'absence',
}

export function eventPropGetter(event: CalendarEvent): { className: string } {
  return { className: `holiday-event holiday-event--${TYPE_CLASS[event.resource.type]}` }
}
