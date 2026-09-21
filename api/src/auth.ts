import type { HttpRequest } from '@azure/functions'
import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { HttpError } from './httpHelpers'

export interface AuthenticatedUser {
  oid: string
  displayName: string
}

const TENANT_ID = process.env.AAD_TENANT_ID
const CLIENT_ID = process.env.AAD_CLIENT_ID

let client: jwksClient.JwksClient | undefined

function getJwksClient(): jwksClient.JwksClient {
  if (!client) {
    client = jwksClient({
      jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
      cache: true,
      rateLimit: true,
    })
  }
  return client
}

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  // Some AAD v1.0 tokens carry the key id as x5t instead of kid; for AAD's
  // JWKS the two values are identical per key, so fall back to x5t.
  const kid = header.kid ?? (header as { x5t?: string }).x5t
  getJwksClient().getSigningKey(kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error('Signing key not found'))
      return
    }
    callback(null, key.getPublicKey())
  })
}

interface TeamsTokenClaims extends JwtPayload {
  oid?: string
  name?: string
  preferred_username?: string
  upn?: string
}

function verifyToken(token: string): Promise<TeamsTokenClaims> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: CLIENT_ID,
        // Teams SSO tokens can be issued as either v1 or v2 depending on tenant/app config.
        issuer: [`https://login.microsoftonline.com/${TENANT_ID}/v2.0`, `https://sts.windows.net/${TENANT_ID}/`],
      },
      (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
          reject(new HttpError(401, `Invalid token: ${err?.message ?? 'malformed payload'}`))
          return
        }
        resolve(decoded as TeamsTokenClaims)
      },
    )
  })
}

export async function getAuthenticatedUser(request: HttpRequest): Promise<AuthenticatedUser> {
  if (!TENANT_ID || !CLIENT_ID) {
    throw new HttpError(500, 'Server is missing AAD_TENANT_ID/AAD_CLIENT_ID configuration')
  }

  const header = request.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) {
    throw new HttpError(401, 'Missing bearer token')
  }

  const claims = await verifyToken(token)
  if (!claims.oid) {
    throw new HttpError(401, 'Token is missing an oid claim')
  }

  return {
    oid: claims.oid,
    displayName: claims.name ?? claims.preferred_username ?? claims.upn ?? 'Unknown',
  }
}
