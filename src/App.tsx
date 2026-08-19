import { useEffect, useState } from 'react'
import { app, authentication } from '@microsoft/teams-js'
import { jwtDecode } from 'jwt-decode'
import './App.css'

interface TeamsIdToken {
  name?: string
  preferred_username?: string
  upn?: string
}

type Status =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'success'; name: string; email: string }

function App() {
  const [status, setStatus] = useState<Status>({ state: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function signIn() {
      try {
        await app.initialize()
        const token = await authentication.getAuthToken()
        const claims = jwtDecode<TeamsIdToken>(token)

        if (cancelled) return
        setStatus({
          state: 'success',
          name: claims.name ?? 'Unknown',
          email: claims.preferred_username ?? claims.upn ?? 'Unknown',
        })
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
        </div>
      )}

      {status.state === 'success' && (
        <div className="sso-card sso-success">
          <p>Signed in via Teams SSO</p>
          <p>
            <strong>Name:</strong> {status.name}
          </p>
          <p>
            <strong>Email:</strong> {status.email}
          </p>
        </div>
      )}
    </section>
  )
}

export default App
