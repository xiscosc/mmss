import { ProxyResult } from 'aws-lambda'

export function stringIsValid(value?: string | null): boolean {
  return !(value === null || value === undefined || value.replace(' ', '').length === 0)
}

export function badRequest(message: object): ProxyResult {
  return getResponse(400, message)
}

export function conflict(message: object): ProxyResult {
  return getResponse(409, message)
}

export function unauthorized(message: object): ProxyResult {
  return getResponse(401, message)
}

export function notFound(message: object): ProxyResult {
  return getResponse(404, message)
}

export function internalServerError(message: object): ProxyResult {
  return getResponse(500, message)
}

export function ok(message: object): ProxyResult {
  return getResponse(200, message)
}

export function created(message: object): ProxyResult {
  return getResponse(201, message)
}

export function isValidUuid(value?: string | null): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
  return uuidRegex.test(value || '')
}

function getResponse(statusCode: number, message: Object): ProxyResult {
  return {
    statusCode,
    body: JSON.stringify(message),
  }
}
