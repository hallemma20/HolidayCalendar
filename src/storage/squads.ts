import type { Squad, SquadMember } from '../types'
import { ApiError, apiFetch } from './apiClient'
import { readJson, writeJson } from './localStorageClient'

const ACTIVE_SQUAD_KEY = 'holidayCalendar.activeSquadId.v1'

// mirrors POST /groups
export function createSquad(name: string, creator: SquadMember): Promise<Squad> {
  return apiFetch<Squad>('/groups', {
    method: 'POST',
    body: JSON.stringify({ name, creator }),
  })
}

// mirrors POST /groups/join { inviteCode }
export async function joinSquad(inviteCode: string, member: SquadMember): Promise<Squad | null> {
  try {
    return await apiFetch<Squad>('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode, member }),
    })
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// mirrors GET /groups
export function listSquads(oid: string): Promise<Squad[]> {
  return apiFetch<Squad[]>(`/groups?oid=${encodeURIComponent(oid)}`)
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
