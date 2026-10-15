import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { HOLIDAY_TYPES } from '../types'
import type { Holiday, HolidayType, NewHolidayInput, Squad } from '../types'
import TypeSelect from './TypeSelect'
import '../App.css'

interface EventModalProps {
  mode: 'add' | 'edit'
  initial?: Holiday
  canEdit?: boolean
  isSubmitting?: boolean
  // Add mode only: the user's squads. With 2+, a "Squads" section lets them choose
  // which calendars the event goes to (all by default).
  squads?: Squad[]
  onClose: () => void
  onSubmit: (input: NewHolidayInput, squadIds: string[]) => void
  onDelete?: () => void
}

function toDateInput(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd')
}

function toTimeInput(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

function EventModal({
  mode,
  initial,
  canEdit = true,
  isSubmitting,
  squads = [],
  onClose,
  onSubmit,
  onDelete,
}: EventModalProps) {
  const [type, setType] = useState<HolidayType>(initial?.type ?? HOLIDAY_TYPES[0])
  const [startDate, setStartDate] = useState(initial ? toDateInput(initial.startUtc) : '')
  const [endDate, setEndDate] = useState(initial ? toDateInput(initial.endUtc) : '')
  const [allDay, setAllDay] = useState(initial?.allDay ?? true)
  const [startTime, setStartTime] = useState(initial && !initial.allDay ? toTimeInput(initial.startUtc) : '')
  const [endTime, setEndTime] = useState(initial && !initial.allDay ? toTimeInput(initial.endUtc) : '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [error, setError] = useState<string | null>(null)
  const [squadsOpen, setSquadsOpen] = useState(false)
  // Stored as the squads switched OFF, so the default (empty) means "all squads".
  const [excludedSquadIds, setExcludedSquadIds] = useState<ReadonlySet<string>>(new Set())

  const readOnly = mode === 'edit' && !canEdit
  const showSquads = mode === 'add' && squads.length > 1
  const selectedSquadIds = squads.filter((s) => !excludedSquadIds.has(s.id)).map((s) => s.id)

  function toggleSquad(squadId: string) {
    setExcludedSquadIds((prev) => {
      const next = new Set(prev)
      if (!next.delete(squadId)) next.add(squadId)
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate) {
      setError('Fill in the start and end date.')
      return
    }
    if (!allDay && (!startTime || !endTime)) {
      setError('Fill in the start and end time, or mark this as an all-day event.')
      return
    }

    const start = new Date(`${startDate}T${allDay ? '00:00' : startTime}`)
    const end = new Date(`${endDate}T${allDay ? '00:00' : endTime}`)
    if (end < start) {
      setError('End must be after start.')
      return
    }

    if (showSquads && selectedSquadIds.length === 0) {
      setSquadsOpen(true)
      setError('Select at least one squad to add this event to.')
      return
    }

    onSubmit(
      {
        startDate,
        endDate,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        allDay,
        type,
        note: note.trim() || undefined,
      },
      selectedSquadIds,
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add Event' : 'Event Details'}</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Event Type</label>
            <TypeSelect value={type} onChange={setType} disabled={readOnly} />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="field">
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          <label className="checkbox-field">
            <span className={`toggle-switch ${allDay ? 'toggle-switch--on' : ''}`}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                disabled={readOnly}
              />
              <span className="toggle-switch-thumb" />
            </span>
            All day event
          </label>

          {!allDay && (
            <div className="field-row">
              <div className="field">
                <label htmlFor="start-time">Start Time</label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="field">
                <label htmlFor="end-time">End Time</label>
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>
          )}

          {showSquads && (
            <div className="field">
              <label>Squads</label>
              <p className="squad-picker-summary">
                {selectedSquadIds.length === squads.length
                  ? 'By default, this event will be added to all the squad calendars you are part of.'
                  : `This event will be added to ${selectedSquadIds.length} of your ${squads.length} squads.`}
              </p>
              <button
                type="button"
                className="squad-picker-toggle"
                aria-expanded={squadsOpen}
                onClick={() => setSquadsOpen((open) => !open)}
              >
                {squadsOpen ? '▾' : '▸'} Customise squads
              </button>
              {squadsOpen && (
                <div className="squad-picker-list">
                  {squads.map((s) => (
                    <label key={s.id} className="squad-picker-option">
                      <input
                        type="checkbox"
                        checked={!excludedSquadIds.has(s.id)}
                        onChange={() => toggleSquad(s.id)}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="note">{mode === 'add' ? 'Notes (optional)' : 'Notes'}</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              disabled={readOnly}
            />
          </div>

          {error && <p className="entry-error">{error}</p>}

          <div className="modal-actions">
            {mode === 'edit' && canEdit && onDelete && (
              <button type="button" className="btn btn-danger-ghost" onClick={onDelete} disabled={isSubmitting}>
                Delete
              </button>
            )}
            <div className="modal-actions-end">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {readOnly ? 'Close' : 'Cancel'}
              </button>
              {!readOnly && (
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {mode === 'add' ? 'Add Event' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
