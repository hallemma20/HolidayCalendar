export type HolidayType =
  | 'Annual Leave'
  | 'Private Appointment'
  | 'TOIL'
  | 'Wellbeing'
  | 'Absence'

export interface SquadMember {
  oid: string
  displayName: string
  joinedAt: string
}

export interface Squad {
  id: string
  name: string
  createdBy: string
  createdAt: string
  inviteCode: string
  members: SquadMember[]
}

export interface Holiday {
  id: string
  groupId: string
  oid: string
  displayName: string
  startUtc: string
  endUtc: string
  allDay: boolean
  type: HolidayType
  note?: string
  createdAt: string
  updatedAt: string
}
