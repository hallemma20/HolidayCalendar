import { useEffect, useState } from 'react'
import { Calendar } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { eventPropGetter, localizer, mapHolidayToEvent } from '../calendar/calendarAdapters'
import { addHoliday, listHolidays } from '../storage/holidays'
import { listSquads } from '../storage/squads'
import type { Holiday, NewHolidayInput, Squad, SquadMember } from '../types'
import AddEventModal from '../components/AddEventModal'
import '../App.css'

interface CalendarScreenProps {
  squadId: string
  currentUser: SquadMember
  onChangeSquad: () => void
}

function CalendarScreen({ squadId, currentUser, onChangeSquad }: CalendarScreenProps) {
  const [squad, setSquad] = useState<Squad | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [squads, groupHolidays] = await Promise.all([
          listSquads(currentUser.oid),
          listHolidays(squadId, currentUser.oid),
        ])
        if (cancelled) return
        setSquad(squads.find((s) => s.id === squadId) ?? null)
        setHolidays(groupHolidays)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load squad.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [squadId, currentUser.oid])

  async function handleAddEvent(input: NewHolidayInput) {
    try {
      const holiday = await addHoliday(squadId, input, currentUser)
      setHolidays((prev) => [...prev, holiday])
      setIsModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event.')
    }
  }

  if (isLoading) {
    return (
      <section className="calendar-screen">
        <p>Loading squad…</p>
      </section>
    )
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

      {error && <p className="entry-error">{error}</p>}

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
