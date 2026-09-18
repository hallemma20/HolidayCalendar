import { useEffect, useState } from 'react'
import { addMonths, addWeeks, endOfWeek, format, startOfWeek } from 'date-fns'
import { Calendar, type View } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { eventPropGetter, localizer, mapHolidayToEvent } from '../calendar/calendarAdapters'
import { addHoliday, deleteHoliday, listHolidays, updateHoliday } from '../storage/holidays'
import { listSquads } from '../storage/squads'
import type { Holiday, NewHolidayInput, Squad } from '../types'
import EventModal from '../components/EventModal'
import '../App.css'

interface CalendarScreenProps {
  squadId: string
  currentUserOid: string
  onChangeSquad: () => void
}

type ModalState = { mode: 'add' } | { mode: 'edit'; holiday: Holiday } | null

function shiftDate(current: Date, view: View, direction: 1 | -1): Date {
  return view === 'week' ? addWeeks(current, direction) : addMonths(current, direction)
}

function formatRangeLabel(date: Date, view: View): string {
  if (view === 'month') return format(date, 'MMMM yyyy')
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  const sameMonth = start.getMonth() === end.getMonth()
  return `${format(start, sameMonth ? 'd' : 'd MMM')} – ${format(end, 'd MMM yyyy')}`
}

function CalendarScreen({ squadId, currentUserOid, onChangeSquad }: CalendarScreenProps) {
  const [squad, setSquad] = useState<Squad | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [squads, groupHolidays] = await Promise.all([listSquads(), listHolidays(squadId)])
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
  }, [squadId])

  async function handleAddEvent(input: NewHolidayInput) {
    setIsSubmitting(true)
    try {
      const holiday = await addHoliday(squadId, input)
      setHolidays((prev) => [...prev, holiday])
      setModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateEvent(holidayId: string, input: NewHolidayInput) {
    setIsSubmitting(true)
    try {
      const updated = await updateHoliday(squadId, holidayId, input)
      setHolidays((prev) => prev.map((h) => (h.id === updated.id ? updated : h)))
      setModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEvent(holidayId: string) {
    setIsSubmitting(true)
    try {
      await deleteHoliday(squadId, holidayId)
      setHolidays((prev) => prev.filter((h) => h.id !== holidayId))
      setModal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopyInviteCode() {
    if (!squad) return
    try {
      await navigator.clipboard.writeText(squad.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked (e.g. permissions) — the code is still visible to copy by hand.
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
          <p className="calendar-subtitle">View and manage your squad's holidays and time off</p>
        </div>
        <div className="calendar-header-actions">
          <div className="invite-code-chip">
            <span className="invite-code-label">Invite Code</span>
            <span className="invite-code-value">{squad?.inviteCode}</span>
            <button type="button" className="icon-btn" onClick={handleCopyInviteCode} title="Copy invite code">
              {copied ? '✓' : '⧉'}
            </button>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onChangeSquad}>
            Change squad
          </button>
        </div>
      </header>

      {error && <p className="entry-error">{error}</p>}

      <div className="calendar-toolbar">
        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${view === 'month' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${view === 'week' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>

        <div className="calendar-nav">
          <button type="button" className="icon-btn" onClick={() => setDate((d) => shiftDate(d, view, -1))} aria-label="Previous">
            ‹
          </button>
          <button type="button" className="icon-btn" onClick={() => setDate((d) => shiftDate(d, view, 1))} aria-label="Next">
            ›
          </button>
          <span className="calendar-range-label">{formatRangeLabel(date, view)}</span>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'add' })}>
          + Add Event
        </button>
      </div>

      <div className="calendar-surface">
        <Calendar
          localizer={localizer}
          events={holidays.map(mapHolidayToEvent)}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week']}
          components={{ toolbar: () => null }}
          onSelectEvent={(event) => setModal({ mode: 'edit', holiday: event.resource })}
          style={{ height: 650 }}
        />
      </div>

      {modal?.mode === 'add' && (
        <EventModal
          mode="add"
          isSubmitting={isSubmitting}
          onClose={() => setModal(null)}
          onSubmit={handleAddEvent}
        />
      )}

      {modal?.mode === 'edit' && (
        <EventModal
          key={modal.holiday.id}
          mode="edit"
          initial={modal.holiday}
          canEdit={modal.holiday.oid === currentUserOid}
          isSubmitting={isSubmitting}
          onClose={() => setModal(null)}
          onSubmit={(input) => handleUpdateEvent(modal.holiday.id, input)}
          onDelete={() => handleDeleteEvent(modal.holiday.id)}
        />
      )}
    </section>
  )
}

export default CalendarScreen
