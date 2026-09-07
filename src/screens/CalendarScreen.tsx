import { useState } from 'react'
import { Calendar } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { eventPropGetter, localizer, mapHolidayToEvent } from '../calendar/calendarAdapters'
import { addHoliday, listHolidays } from '../storage/holidays'
import { getSquad } from '../storage/squads'
import type { Holiday, NewHolidayInput, Squad, SquadMember } from '../types'
import AddEventModal from '../components/AddEventModal'
import '../App.css'

interface CalendarScreenProps {
  squadId: string
  currentUser: SquadMember
  onChangeSquad: () => void
}

function CalendarScreen({ squadId, currentUser, onChangeSquad }: CalendarScreenProps) {
  const [squad] = useState<Squad | null>(() => getSquad(squadId))
  const [holidays, setHolidays] = useState<Holiday[]>(() => listHolidays(squadId))
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleAddEvent(input: NewHolidayInput) {
    const holiday = addHoliday(squadId, input, currentUser)
    setHolidays((prev) => [...prev, holiday])
    setIsModalOpen(false)
  }

  return (
    <section className="calendar-screen">
      <header className="calendar-header">
        <div>
          <h1>{squad?.name ?? 'Squad'}</h1>
          <p className="invite-code">Invite code: {squad?.inviteCode}</p>
        </div>
        <div className="calendar-header-actions">
          <button onClick={() => setIsModalOpen(true)}>Add event</button>
          <button className="change-squad-link" onClick={onChangeSquad}>
            Change squad
          </button>
        </div>
      </header>

      <Calendar
        localizer={localizer}
        events={holidays.map(mapHolidayToEvent)}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventPropGetter}
        defaultView="month"
        views={['month', 'week']}
        style={{ height: 650 }}
      />

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEvent}
      />
    </section>
  )
}

export default CalendarScreen
