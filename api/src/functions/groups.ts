import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getAuthenticatedUser } from '../auth'
import { getGroupsContainer } from '../cosmosClient'
import { errorResponse, HttpError, json } from '../httpHelpers'
import { requireMember } from '../membership'
import type { Squad } from '../types'

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

async function createGroup(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const body = (await request.json()) as { name?: string }
    if (!body.name?.trim()) {
      throw new HttpError(400, 'name is required')
    }

    const squad: Squad = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      createdBy: user.oid,
      createdAt: new Date().toISOString(),
      inviteCode: generateInviteCode(),
      members: [{ oid: user.oid, displayName: user.displayName, joinedAt: new Date().toISOString() }],
    }
    await getGroupsContainer().items.create(squad)
    return json(201, squad)
  } catch (err) {
    return errorResponse(err)
  }
}

async function joinGroup(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const body = (await request.json()) as { inviteCode?: string }
    if (!body.inviteCode?.trim()) {
      throw new HttpError(400, 'inviteCode is required')
    }
    const normalizedCode = body.inviteCode.trim().toUpperCase()

    const { resources } = await getGroupsContainer()
      .items.query<Squad>({
        query: 'SELECT * FROM c WHERE c.inviteCode = @code',
        parameters: [{ name: '@code', value: normalizedCode }],
      })
      .fetchAll()

    const squad = resources[0]
    if (!squad) {
      throw new HttpError(404, 'No squad found with that invite code')
    }

    const alreadyMember = squad.members.some((m) => m.oid === user.oid)
    const updatedSquad: Squad = alreadyMember
      ? squad
      : {
          ...squad,
          members: [...squad.members, { oid: user.oid, displayName: user.displayName, joinedAt: new Date().toISOString() }],
        }

    if (!alreadyMember) {
      await getGroupsContainer().item(squad.id, squad.id).replace(updatedSquad)
    }
    return json(200, updatedSquad)
  } catch (err) {
    return errorResponse(err)
  }
}

async function listGroups(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)

    const { resources } = await getGroupsContainer()
      .items.query<Squad>({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {"oid": @oid}, true)',
        parameters: [{ name: '@oid', value: user.oid }],
      })
      .fetchAll()

    return json(200, resources)
  } catch (err) {
    return errorResponse(err)
  }
}

async function regenerateInviteCode(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const groupId = request.params.groupId
    if (!groupId) {
      throw new HttpError(400, 'groupId is required')
    }

    const squad = await requireMember(groupId, user.oid)
    const updatedSquad: Squad = { ...squad, inviteCode: generateInviteCode() }
    await getGroupsContainer().item(groupId, groupId).replace(updatedSquad)
    return json(200, updatedSquad)
  } catch (err) {
    return errorResponse(err)
  }
}

async function leaveGroup(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const groupId = request.params.groupId
    if (!groupId) {
      throw new HttpError(400, 'groupId is required')
    }

    const squad = await requireMember(groupId, user.oid)
    const remainingMembers = squad.members.filter((m) => m.oid !== user.oid)

    if (remainingMembers.length === 0) {
      // No admin role — an emptied squad has nothing left to isolate, so it's cleaned up
      // rather than left as an orphaned document with no members able to reach it.
      await getGroupsContainer().item(groupId, groupId).delete()
    } else {
      await getGroupsContainer().item(groupId, groupId).replace({ ...squad, members: remainingMembers })
    }
    return json(204, null)
  } catch (err) {
    return errorResponse(err)
  }
}

app.http('createGroup', {
  methods: ['POST'],
  route: 'groups',
  authLevel: 'anonymous',
  handler: createGroup,
})

app.http('joinGroup', {
  methods: ['POST'],
  route: 'groups/join',
  authLevel: 'anonymous',
  handler: joinGroup,
})

app.http('listGroups', {
  methods: ['GET'],
  route: 'groups',
  authLevel: 'anonymous',
  handler: listGroups,
})

app.http('regenerateInviteCode', {
  methods: ['POST'],
  route: 'groups/{groupId}/invite-code/regenerate',
  authLevel: 'anonymous',
  handler: regenerateInviteCode,
})

app.http('leaveGroup', {
  methods: ['DELETE'],
  route: 'groups/{groupId}/members/me',
  authLevel: 'anonymous',
  handler: leaveGroup,
})
