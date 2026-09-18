import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getAuthenticatedUser } from '../auth'
import { getHolidaysContainer } from '../cosmosClient'
import { errorResponse, HttpError, json } from '../httpHelpers'
import { requireMember } from '../membership'
import type { Holiday, HolidayType } from '../types'

interface NewHolidayBody {
  startUtc?: string
  endUtc?: string
  allDay?: boolean
  type?: HolidayType
  note?: string
}

async function listHolidays(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const groupId = request.params.groupId
    if (!groupId) {
      throw new HttpError(400, 'groupId is required')
    }
    await requireMember(groupId, user.oid)

    const { resources } = await getHolidaysContainer()
      .items.query<Holiday>(
        { query: 'SELECT * FROM c WHERE c.groupId = @groupId', parameters: [{ name: '@groupId', value: groupId }] },
        { partitionKey: groupId },
      )
      .fetchAll()

    return json(200, resources)
  } catch (err) {
    return errorResponse(err)
  }
}

async function addHoliday(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const groupId = request.params.groupId
    const body = (await request.json()) as NewHolidayBody
    if (!groupId || !body.startUtc || !body.endUtc || !body.type) {
      throw new HttpError(400, 'groupId, startUtc, endUtc and type are required')
    }
    await requireMember(groupId, user.oid)

    const now = new Date().toISOString()
    const holiday: Holiday = {
      id: crypto.randomUUID(),
      groupId,
      oid: user.oid,
      displayName: user.displayName,
      startUtc: body.startUtc,
      endUtc: body.endUtc,
      allDay: body.allDay ?? false,
      type: body.type,
      note: body.note,
      createdAt: now,
      updatedAt: now,
    }
    await getHolidaysContainer().items.create(holiday)
    return json(201, holiday)
  } catch (err) {
    return errorResponse(err)
  }
}

async function updateHoliday(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const holidayId = request.params.holidayId
    const body = (await request.json()) as Partial<Holiday> & { groupId?: string }
    if (!holidayId || !body.groupId) {
      throw new HttpError(400, 'groupId is required')
    }

    const { resource: existing } = await getHolidaysContainer()
      .item(holidayId, body.groupId)
      .read<Holiday>()
    if (!existing) {
      throw new HttpError(404, `Holiday ${holidayId} not found`)
    }
    if (existing.oid !== user.oid) {
      throw new HttpError(403, 'You can only edit your own entries')
    }

    const updated: Holiday = {
      ...existing,
      startUtc: body.startUtc ?? existing.startUtc,
      endUtc: body.endUtc ?? existing.endUtc,
      allDay: body.allDay ?? existing.allDay,
      type: body.type ?? existing.type,
      note: body.note ?? existing.note,
      updatedAt: new Date().toISOString(),
    }
    await getHolidaysContainer().item(holidayId, body.groupId).replace(updated)
    return json(200, updated)
  } catch (err) {
    return errorResponse(err)
  }
}

async function deleteHoliday(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const user = await getAuthenticatedUser(request)
    const holidayId = request.params.holidayId
    const body = (await request.json()) as { groupId?: string }
    if (!holidayId || !body.groupId) {
      throw new HttpError(400, 'groupId is required')
    }

    const { resource: existing } = await getHolidaysContainer()
      .item(holidayId, body.groupId)
      .read<Holiday>()
    if (!existing) {
      throw new HttpError(404, `Holiday ${holidayId} not found`)
    }
    if (existing.oid !== user.oid) {
      throw new HttpError(403, 'You can only delete your own entries')
    }

    await getHolidaysContainer().item(holidayId, body.groupId).delete()
    return json(204, null)
  } catch (err) {
    return errorResponse(err)
  }
}

app.http('listHolidays', {
  methods: ['GET'],
  route: 'groups/{groupId}/holidays',
  authLevel: 'anonymous',
  handler: listHolidays,
})

app.http('addHoliday', {
  methods: ['POST'],
  route: 'groups/{groupId}/holidays',
  authLevel: 'anonymous',
  handler: addHoliday,
})

app.http('updateHoliday', {
  methods: ['PATCH'],
  route: 'holidays/{holidayId}',
  authLevel: 'anonymous',
  handler: updateHoliday,
})

app.http('deleteHoliday', {
  methods: ['DELETE'],
  route: 'holidays/{holidayId}',
  authLevel: 'anonymous',
  handler: deleteHoliday,
})
