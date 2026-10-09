import type { Squad } from '../types'
import '../App.css'

interface SquadPickerScreenProps {
  squads: Squad[]
  onSelectSquad: (squadId: string) => void
  onAddSquad: () => void
}

function SquadPickerScreen({ squads, onSelectSquad, onAddSquad }: SquadPickerScreenProps) {
  return (
    <section id="center" className="screen-entry">
      <div className="entry-card">
        <h1>Your squads</h1>
        <p className="entry-subtitle">Choose a squad to see its calendar.</p>

        <ul className="squad-list">
          {squads.map((squad) => (
            <li key={squad.id}>
              <button type="button" className="squad-list-item" onClick={() => onSelectSquad(squad.id)}>
                <span className="squad-list-name">{squad.name}</span>
                <span className="squad-list-meta">
                  {squad.members.length} {squad.members.length === 1 ? 'member' : 'members'}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button type="button" className="btn btn-secondary" onClick={onAddSquad}>
          Create or join another squad
        </button>
      </div>
    </section>
  )
}

export default SquadPickerScreen
