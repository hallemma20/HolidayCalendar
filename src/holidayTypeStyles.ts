import type { HolidayType } from './types'

// Short CSS-class-safe slug per holiday type, shared by the calendar's event
// colors and the type-select dropdown's colored dots so they never drift apart.
export const HOLIDAY_TYPE_SLUG: Record<HolidayType, string> = {
  'Annual Leave': 'annual',
  'Private Appointment': 'appointment',
  TOIL: 'toil',
  Wellbeing: 'wellbeing',
  Absence: 'absence',
}
