import type { Squad, SquadMember } from '../types'
import { readJson, writeJson } from './localStorageClient'

const SQUADS_KEY = 'holidayCalendar.squads.v1'
const ACTIVE_SQUAD_KEY = 'holidayCalendar.activeSquadId.v1'

// Unambiguous alphabet (no 0/O/1/I/l) so a code is easy to read aloud/type.
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 8

function generateInviteCode(): string {
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)]
  }
  return code
}

function readSquads(): Squad[] {
  return readJson<Squad[]>(SQUADS_KEY, [])
}

function writeSquads(squads: Squad[]): void {
  writeJson(SQUADS_KEY, squads)
}

// mirrors POST /groups
export function createSquad(name: string, creator: SquadMember): Squad {
  const squad: Squad = {
    id: crypto.randomUUID(),
    name,
    createdBy: creator.oid,
    createdAt: new Date().toISOString(),
    inviteCode: generateInviteCode(),
    members: [creator],
  }
  writeSquads([...readSquads(), squad])
  return squad
}

// mirrors POST /groups/join { inviteCode }
// NOTE: this only searches squads created in this browser's localStorage — there is
// no shared backend yet, so a code from another device/browser will not resolve here.
export function joinSquad(inviteCode: string, member: SquadMember): Squad | null {
  const squads = readSquads()
  const normalizedCode = inviteCode.trim().toUpperCase()
  const squad = squads.find((s) => s.inviteCode === normalizedCode)
  if (!squad) return null

  const alreadyMember = squad.members.some((m) => m.oid === member.oid)
  const updatedSquad: Squad = alreadyMember
    ? squad
    : { ...squad, members: [...squad.members, member] }

  writeSquads(squads.map((s) => (s.id === squad.id ? updatedSquad : s)))
  return updatedSquad
}

// mirrors GET /groups
export function listSquads(oid: string): Squad[] {
  return readSquads().filter((s) => s.members.some((m) => m.oid === oid))
}

export function getSquad(id: string): Squad | null {
  return readSquads().find((s) => s.id === id) ?? null
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
