import { useState, type FormEvent } from 'react'
import { HOLIDAY_TYPES } from '../types'
import type { HolidayType, NewHolidayInput } from '../types'
import '../App.css'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: NewHolidayInput) => void
}

function AddEventModal({ isOpen, onClose, onSubmit }: AddEventModalProps) {
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [type, setType] = useState<HolidayType>(HOLIDAY_TYPES[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Fill in the start and end date/time.')
      return
    }
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    if (end < start) {
      setError('End must be after start.')
      return
    }

    onSubmit({
      startDate,
      startTime,
      endDate,
      endTime,
      type,
      note: note.trim() || undefined,
    })

    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setType(HOLIDAY_TYPES[0])
    setNote('')
    setError(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Add event</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="start-date">Start date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label htmlFor="start-time">Start time</label>
          <input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label htmlFor="end-date">End date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <label htmlFor="end-time">End time</label>
          <input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <label htmlFor="holiday-type">Type</label>
          <select
            id="holiday-type"
            value={type}
            onChange={(e) => setType(e.target.value as HolidayType)}
          >
            {HOLIDAY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label htmlFor="note">Note (optional)</label>
          <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} />

          {error && <p className="entry-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Add event</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEventModal
