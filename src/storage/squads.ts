import type { Squad } from '../types'
import { ApiError, apiFetch } from './apiClient'
import { readJson, writeJson } from './localStorageClient'

const ACTIVE_SQUAD_KEY = 'holidayCalendar.activeSquadId.v1'

// mirrors POST /groups — creator is derived server-side from the SSO bearer token
export function createSquad(name: string): Promise<Squad> {
  return apiFetch<Squad>('/groups', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

// mirrors POST /groups/join { inviteCode } — member is derived server-side from the SSO bearer token
export async function joinSquad(inviteCode: string): Promise<Squad | null> {
  try {
    return await apiFetch<Squad>('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    })
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// mirrors GET /groups — caller is derived server-side from the SSO bearer token
export function listSquads(): Promise<Squad[]> {
  return apiFetch<Squad[]>('/groups')
}

export function getActiveSquadId(): string | null {
  return readJson<string | null>(ACTIVE_SQUAD_KEY, null)
}

export function setActiveSquadId(id: string): void {
  writeJson(ACTIVE_SQUAD_KEY, id)
}

export function clearActiveSquadId(): void {
  window.localStorage.removeItem(ACTIVE_SQUAD_KEY)
}
