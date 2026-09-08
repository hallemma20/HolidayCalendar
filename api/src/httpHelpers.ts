import type { HttpResponseInit } from '@azure/functions'

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function json(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  }
}

export function errorResponse(err: unknown): HttpResponseInit {
  if (err instanceof HttpError) {
    return json(err.status, { error: err.message })
  }
  return json(500, { error: err instanceof Error ? err.message : 'Unexpected error' })
}
