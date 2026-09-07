import { useState, type FormEvent } from 'react'
import { createSquad, joinSquad } from '../storage/squads'
import type { SquadMember } from '../types'
import '../App.css'

interface EntryScreenProps {
  currentUser: SquadMember
  onSquadReady: (squadId: string) => void
}

type Mode = 'choice' | 'create' | 'join'

function EntryScreen({ currentUser, onSquadReady }: EntryScreenProps) {
  const [mode, setMode] = useState<Mode>('choice')
  const [squadName, setSquadName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = squadName.trim()
    if (!trimmed) {
      setError('Enter a name for your squad.')
      return
    }
    const squad = createSquad(trimmed, currentUser)
    onSquadReady(squad.id)
  }

  function handleJoin(e: FormEvent) {
    e.preventDefault()
    const trimmed = inviteCode.trim()
    if (!trimmed) {
      setError('Enter an invite code.')
      return
    }
    const squad = joinSquad(trimmed, currentUser)
    if (!squad) {
      setError(
        "No squad found with that code. In this prototype, a code only works if the squad was created in this same browser — cross-device joining arrives once the app has a shared backend.",
      )
      return
    }
    onSquadReady(squad.id)
  }

  return (
    <section id="center" className="screen-entry">
      <h1>Holiday Calendar</h1>

      {mode === 'choice' && (
        <div className="entry-choice">
          <button onClick={() => setMode('create')}>Create a new squad</button>
          <button onClick={() => setMode('join')}>Join with invite code</button>
        </div>
      )}

      {mode === 'create' && (
        <form className="entry-form" onSubmit={handleCreate}>
          <label htmlFor="squad-name">Squad name</label>
          <input
            id="squad-name"
            type="text"
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            autoFocus
          />
          {error && <p className="entry-error">{error}</p>}
          <div className="entry-form-actions">
            <button type="button" onClick={() => setMode('choice')}>
              Back
            </button>
            <button type="submit">Create squad</button>
          </div>
        </form>
      )}

      {mode === 'join' && (
        <form className="entry-form" onSubmit={handleJoin}>
          <label htmlFor="invite-code">Invite code</label>
          <input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            autoFocus
          />
          {error && <p className="entry-error">{error}</p>}
          <div className="entry-form-actions">
            <button type="button" onClick={() => setMode('choice')}>
              Back
            </button>
            <button type="submit">Join squad</button>
          </div>
        </form>
      )}
    </section>
  )
}

export default EntryScreen
