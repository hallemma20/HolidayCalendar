import { useEffect, useState } from 'react'
import { app, authentication } from '@microsoft/teams-js'
import { jwtDecode } from 'jwt-decode'
import EntryScreen from './screens/EntryScreen'
import CalendarScreen from './screens/CalendarScreen'
import SquadPickerScreen from './screens/SquadPickerScreen'
import { setAuthToken } from './auth/token'
import { listSquads } from './storage/squads'
import type { Squad } from './types'
import './App.css'

interface TeamsIdToken {
  name?: string
  preferred_username?: string
  upn?: string
  oid?: string
}

type Status =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'success'; name: string; email: string; oid: string }

type Screen = { view: 'entry' } | { view: 'picker' } | { view: 'calendar'; squadId: string }

function App() {
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  const [screen, setScreen] = useState<Screen>({ view: 'entry' })
  const [squads, setSquads] = useState<Squad[]>([])

  // Loads the user's squads and picks the landing screen: none -> create/join,
  // one -> straight to its calendar, several -> the squad picker.
  async function resolveInitialScreen() {
    try {
      const mine = await listSquads()
      setSquads(mine)
      if (mine.length === 1) {
        setScreen({ view: 'calendar', squadId: mine[0].id })
      } else if (mine.length > 1) {
        setScreen({ view: 'picker' })
      }
    } catch {
      // Couldn't load squads (e.g. offline) — fall back to the entry screen.
    }
  }

  function backToSquads(): Screen {
    return squads.length === 1 ? { view: 'calendar', squadId: squads[0].id } : { view: 'picker' }
  }

  useEffect(() => {
    let cancelled = false

    async function signIn() {
      try {
        await app.initialize()
        const token = await authentication.getAuthToken()
        setAuthToken(token)
        const claims = jwtDecode<TeamsIdToken>(token)

        if (cancelled) return
        const oid = claims.oid ?? claims.preferred_username ?? claims.upn ?? 'unknown-oid'
        setStatus({
          state: 'success',
          name: claims.name ?? 'Unknown',
          email: claims.preferred_username ?? claims.upn ?? 'Unknown',
          oid,
        })
        await resolveInitialScreen()
      } catch (err) {
        if (cancelled) return
        setStatus({
          state: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to sign in with Teams SSO.',
        })
      }
    }

    void signIn()
    return () => {
      cancelled = true
    }
  }, [])

  if (status.state === 'success' && screen.view === 'entry') {
    return (
      <EntryScreen
        onCancel={squads.length > 0 ? () => setScreen(backToSquads()) : undefined}
        onSquadReady={async (squadId) => {
          try {
            setSquads(await listSquads())
          } catch {
            // The calendar screen surfaces any load failure itself.
          }
          setScreen({ view: 'calendar', squadId })
        }}
      />
    )
  }

  if (status.state === 'success' && screen.view === 'picker') {
    return (
      <SquadPickerScreen
        squads={squads}
        onSelectSquad={(squadId) => setScreen({ view: 'calendar', squadId })}
        onAddSquad={() => setScreen({ view: 'entry' })}
      />
    )
  }

  if (status.state === 'success' && screen.view === 'calendar') {
    return (
      <CalendarScreen
        squadId={screen.squadId}
        squads={squads}
        currentUserOid={status.oid}
        onSelectSquad={(squadId) => setScreen({ view: 'calendar', squadId })}
        onAddSquad={() => setScreen({ view: 'entry' })}
        onSquadUpdated={(updated) => setSquads((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))}
        onLeftSquad={(leftId) => {
          const remaining = squads.filter((s) => s.id !== leftId)
          setSquads(remaining)
          if (remaining.length === 0) setScreen({ view: 'entry' })
          else if (remaining.length === 1) setScreen({ view: 'calendar', squadId: remaining[0].id })
          else setScreen({ view: 'picker' })
        }}
      />
    )
  }

  return (
    <section id="center">
      <h1>Holiday Calendar</h1>

      {status.state === 'loading' && <p>Signing you in via Teams SSO…</p>}

      {status.state === 'error' && (
        <div className="sso-card sso-error">
          <p>SSO sign-in failed.</p>
          <code>{status.message}</code>
          <p>This page needs to be opened inside Microsoft Teams to sign in.</p>
          {import.meta.env.DEV && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStatus({
                  state: 'success',
                  name: 'Local Dev User',
                  email: 'local-dev@example.com',
                  oid: 'local-dev-oid',
                })
                void resolveInitialScreen()
              }}
            >
              Continue as Local Dev User (dev only)
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default App
