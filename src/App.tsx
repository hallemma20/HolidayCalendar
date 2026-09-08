import { useEffect, useState } from 'react'
import { app, authentication } from '@microsoft/teams-js'
import { jwtDecode } from 'jwt-decode'
import EntryScreen from './screens/EntryScreen'
import CalendarScreen from './screens/CalendarScreen'
import { clearActiveSquadId, getActiveSquadId, listSquads, setActiveSquadId } from './storage/squads'
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

type Screen = { view: 'entry' } | { view: 'calendar'; squadId: string }

function App() {
  const [status, setStatus] = useState<Status>({ state: 'loading' })
  const [screen, setScreen] = useState<Screen>({ view: 'entry' })

  async function resolveInitialScreen(oid: string) {
    const activeSquadId = getActiveSquadId()
    if (!activeSquadId) return
    try {
      const squads = await listSquads(oid)
      if (squads.some((s) => s.id === activeSquadId)) {
        setScreen({ view: 'calendar', squadId: activeSquadId })
      } else {
        clearActiveSquadId()
      }
    } catch {
      // Couldn't verify membership (e.g. offline) — fall back to the entry screen
      // rather than showing a calendar we can't confirm the user still belongs to.
      clearActiveSquadId()
    }
  }

  useEffect(() => {
    let cancelled = false

    async function signIn() {
      try {
        await app.initialize()
        const token = await authentication.getAuthToken()
        const claims = jwtDecode<TeamsIdToken>(token)

        if (cancelled) return
        const oid = claims.oid ?? claims.preferred_username ?? claims.upn ?? 'unknown-oid'
        setStatus({
          state: 'success',
          name: claims.name ?? 'Unknown',
          email: claims.preferred_username ?? claims.upn ?? 'Unknown',
          oid,
        })
        await resolveInitialScreen(oid)
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
        currentUser={{ oid: status.oid, displayName: status.name, joinedAt: new Date().toISOString() }}
        onSquadReady={(squadId) => {
          setActiveSquadId(squadId)
          setScreen({ view: 'calendar', squadId })
        }}
      />
    )
  }

  if (status.state === 'success' && screen.view === 'calendar') {
    return (
      <CalendarScreen
        squadId={screen.squadId}
        currentUser={{ oid: status.oid, displayName: status.name, joinedAt: new Date().toISOString() }}
        onChangeSquad={() => {
          clearActiveSquadId()
          setScreen({ view: 'entry' })
        }}
      />
    )
  }

  return (
    <section id="center">
      <h1>Holiday Calendar</h1>
      <p>Teams SSO proof of concept</p>

      {status.state === 'loading' && <p>Signing you in via Teams SSO…</p>}

      {status.state === 'error' && (
        <div className="sso-card sso-error">
          <p>SSO sign-in failed.</p>
          <code>{status.message}</code>
          <p>This page needs to be opened inside Microsoft Teams to sign in.</p>
          {import.meta.env.DEV && (
            <button
              onClick={() => {
                const oid = 'local-dev-oid'
                setStatus({
                  state: 'success',
                  name: 'Local Dev User',
                  email: 'local-dev@example.com',
                  oid,
                })
                void resolveInitialScreen(oid)
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
