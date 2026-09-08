import { getGroupsContainer } from './cosmosClient'
import { HttpError } from './httpHelpers'
import type { Squad } from './types'

export async function getGroupOrThrow(groupId: string): Promise<Squad> {
  const { resource } = await getGroupsContainer().item(groupId, groupId).read<Squad>()
  if (!resource) {
    throw new HttpError(404, `Squad ${groupId} not found`)
  }
  return resource
}

export async function requireMember(groupId: string, oid: string): Promise<Squad> {
  const group = await getGroupOrThrow(groupId)
  if (!group.members.some((m) => m.oid === oid)) {
    throw new HttpError(403, 'You are not a member of this squad')
  }
  return group
}
