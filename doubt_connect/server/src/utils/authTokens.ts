import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { env } from '../config/env'
import crypto from 'node:crypto'

export type AccessTokenPayload = {
  sub: string
}

export type RefreshTokenPayload = {
  sub: string
  rti: string
}

export function signAccessToken(userId: string) {
  const payload: AccessTokenPayload = { sub: userId }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL_SECONDS })
}

function base64UrlRandom(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function createRefreshToken(userId: string) {
  const rti = base64UrlRandom(32)
  const payload: RefreshTokenPayload = { sub: userId, rti }
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL_SECONDS })
  return { token, rti }
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

export async function hashToken(tokenOrRti: string) {
  const saltRounds = 12
  return bcrypt.hash(tokenOrRti, saltRounds)
}

export async function compareToken(tokenOrRti: string, hash: string) {
  return bcrypt.compare(tokenOrRti, hash)
}

