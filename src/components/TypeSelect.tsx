import { useEffect, useRef, useState } from 'react'
import { HOLIDAY_TYPE_SLUG } from '../holidayTypeStyles'
import { HOLIDAY_TYPES } from '../types'
import type { HolidayType } from '../types'
import './TypeSelect.css'

interface TypeSelectProps {
  value: HolidayType
  onChange: (type: HolidayType) => void
  disabled?: boolean
}

function TypeSelect({ value, onChange, disabled }: TypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="type-select" ref={rootRef}>
      <button
        type="button"
        className="type-select-trigger"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`type-dot type-dot--${HOLIDAY_TYPE_SLUG[value]}`} />
        <span>{value}</span>
        <span className="type-select-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>

      {isOpen && (
        <ul className="type-select-menu" role="listbox">
          {HOLIDAY_TYPES.map((type) => (
            <li key={type}>
              <button
                type="button"
                className="type-select-option"
                role="option"
                aria-selected={type === value}
                onClick={() => {
                  onChange(type)
                  setIsOpen(false)
                }}
              >
                <span className={`type-dot type-dot--${HOLIDAY_TYPE_SLUG[type]}`} />
                <span>{type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TypeSelect
