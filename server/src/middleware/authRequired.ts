import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../utils/httpError'
import { verifyAccessToken } from '../utils/authTokens'

export type AuthedRequest = Request & { userId?: string }

export function authRequired(req: AuthedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.header('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

  if (!token) return next(new HttpError(401, 'Authentication required', { code: 'AUTH_REQUIRED' }))

  try {
    const payload = verifyAccessToken(token)
    req.userId = payload.sub
    return next()
  } catch {
    return next(new HttpError(401, 'Session expired. Please log in again.', { code: 'TOKEN_INVALID_OR_EXPIRED' }))
  }
}

