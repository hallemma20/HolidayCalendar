import { HOLIDAY_TYPE_SLUG } from '../holidayTypeStyles'
import { HOLIDAY_TYPES, type HolidayType, type SquadMember } from '../types'
import './FilterPanel.css'

interface FilterPanelProps {
  members: SquadMember[]
  currentUserOid: string
  // Filters are stored as the items that are switched OFF, so an empty set means
  // "everything shown" and new members/types default to visible.
  hiddenTypes: ReadonlySet<HolidayType>
  hiddenPeople: ReadonlySet<string>
  onToggleType: (type: HolidayType) => void
  onTogglePerson: (oid: string) => void
  onResetTypes: () => void
  onResetPeople: () => void
  onResetAll: () => void
}

function FilterPanel({
  members,
  currentUserOid,
  hiddenTypes,
  hiddenPeople,
  onToggleType,
  onTogglePerson,
  onResetTypes,
  onResetPeople,
  onResetAll,
}: FilterPanelProps) {
  const typesChanged = hiddenTypes.size > 0
  const peopleChanged = hiddenPeople.size > 0

  return (
    <aside className="filter-panel" aria-label="Calendar filters">
      <div className="filter-panel-header">
        <h2>Filter</h2>
        <button
          type="button"
          className="filter-reset"
          onClick={onResetAll}
          disabled={!typesChanged && !peopleChanged}
        >
          Reset all
        </button>
      </div>

      <fieldset className="filter-section">
        <legend className="filter-section-header">
          <span>Event types</span>
          <button type="button" className="filter-reset" onClick={onResetTypes} disabled={!typesChanged}>
            Reset
          </button>
        </legend>
        {HOLIDAY_TYPES.map((type) => (
          <label key={type} className="filter-option">
            <input type="checkbox" checked={!hiddenTypes.has(type)} onChange={() => onToggleType(type)} />
            <span className={`type-dot type-dot--${HOLIDAY_TYPE_SLUG[type]}`} />
            <span className="filter-option-label">{type}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-section">
        <legend className="filter-section-header">
          <span>People</span>
          <button type="button" className="filter-reset" onClick={onResetPeople} disabled={!peopleChanged}>
            Reset
          </button>
        </legend>
        {members.map((member) => (
          <label key={member.oid} className="filter-option">
            <input
              type="checkbox"
              checked={!hiddenPeople.has(member.oid)}
              onChange={() => onTogglePerson(member.oid)}
            />
            <span className="filter-option-label">
              {member.displayName}
              {member.oid === currentUserOid && <span className="filter-you"> (you)</span>}
            </span>
          </label>
        ))}
      </fieldset>
    </aside>
  )
}

export default FilterPanel
