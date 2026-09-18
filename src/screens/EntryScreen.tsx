import { useState, type FormEvent } from 'react'
import { createSquad, joinSquad } from '../storage/squads'
import '../App.css'

interface EntryScreenProps {
  onSquadReady: (squadId: string) => void
}

type Mode = 'choice' | 'create' | 'join'

function EntryScreen({ onSquadReady }: EntryScreenProps) {
  const [mode, setMode] = useState<Mode>('choice')
  const [squadName, setSquadName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = squadName.trim()
    if (!trimmed) {
      setError('Enter a name for your squad.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const squad = await createSquad(trimmed)
      onSquadReady(squad.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create squad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    const trimmed = inviteCode.trim()
    if (!trimmed) {
      setError('Enter an invite code.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const squad = await joinSquad(trimmed)
      if (!squad) {
        setError('No squad found with that invite code.')
        return
      }
      onSquadReady(squad.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join squad.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="center" className="screen-entry">
      <div className="entry-card">
        <h1>Holiday Calendar</h1>
        <p className="entry-subtitle">
          {mode === 'choice' && 'Create a squad or join one with an invite code.'}
          {mode === 'create' && 'Give your squad a name to get started.'}
          {mode === 'join' && "Enter the invite code your squad shared with you."}
        </p>

        {mode === 'choice' && (
          <div className="entry-choice">
            <button type="button" className="btn btn-primary" onClick={() => setMode('create')}>
              Create a new squad
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setMode('join')}>
              Join with invite code
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form className="entry-form" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="squad-name">Squad name</label>
              <input
                id="squad-name"
                type="text"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="entry-error">{error}</p>}
            <div className="entry-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setMode('choice')} disabled={isSubmitting}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create squad'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form className="entry-form" onSubmit={handleJoin}>
            <div className="field">
              <label htmlFor="invite-code">Invite code</label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="entry-error">{error}</p>}
            <div className="entry-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setMode('choice')} disabled={isSubmitting}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Joining…' : 'Join squad'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default EntryScreen
