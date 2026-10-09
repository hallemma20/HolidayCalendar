import type { Squad } from '../types'
import { ApiError, apiFetch } from './apiClient'

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

// mirrors POST /groups/{id}/invite-code/regenerate — any member may rotate the code
export function regenerateInviteCode(squadId: string): Promise<Squad> {
  return apiFetch<Squad>(`/groups/${squadId}/invite-code/regenerate`, { method: 'POST' })
}

// mirrors DELETE /groups/{id}/members/me — also removes the caller's events from the squad
export async function leaveSquad(squadId: string): Promise<void> {
  await apiFetch<void>(`/groups/${squadId}/members/me`, { method: 'DELETE' })
}
