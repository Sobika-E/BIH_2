import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { User } from '../models/User'
import { HttpError } from '../utils/httpError'
import { compareToken, createRefreshToken, hashToken, signAccessToken, verifyRefreshToken } from '../utils/authTokens'
import { env } from '../config/env'
import { authRequired, type AuthedRequest } from '../middleware/authRequired'

const router = Router()

const signupSchema = z
  .object({
    name: z.string().min(2).max(80),
    department: z.string().min(2).max(80),
    year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    rollNumber: z.string().min(2).max(40),
    email: z.string().email(),
    mobileNumber: z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((v) => /[A-Z]/.test(v.password), { path: ['password'], message: 'Password must contain an uppercase letter' })
  .refine((v) => /[a-z]/.test(v.password), { path: ['password'], message: 'Password must contain a lowercase letter' })
  .refine((v) => /[0-9]/.test(v.password), { path: ['password'], message: 'Password must contain a number' })
  .refine((v) => /[^A-Za-z0-9]/.test(v.password), {
    path: ['password'],
    message: 'Password must contain a special character',
  })

const loginSchema = z.object({
  identifier: z.string().min(1), // email or rollNumber
  password: z.string().min(1),
})

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth/refresh',
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
  }
}

router.post('/signup', async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body)

    const email = data.email.toLowerCase().trim()
    const rollNumber = data.rollNumber.trim()

    const existing = await User.findOne({ $or: [{ email }, { rollNumber }] }).lean()
    if (existing) throw new HttpError(409, 'Email or Roll Number already registered', { code: 'USER_EXISTS' })

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await User.create({
      name: data.name.trim(),
      department: data.department.trim(),
      year: data.year,
      rollNumber,
      email,
      mobileNumber: data.mobileNumber.trim(),
      passwordHash,
    })

    return res.status(201).json({
      message: 'Signup successful',
      user: { id: user.id, name: user.name, year: user.year, email: user.email, rollNumber: user.rollNumber },
    })
  } catch (err) {
    return next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    const identifier = data.identifier.trim().toLowerCase()

    const user = await User.findOne({
      $or: [{ email: identifier }, { rollNumber: data.identifier.trim() }],
    }).select('+passwordHash +refreshTokenHash +refreshTokenIssuedAt')

    if (!user) throw new HttpError(401, 'Invalid email or password. Need an account? Sign up first.', { code: 'INVALID_CREDENTIALS' })

    const ok = await bcrypt.compare(data.password, user.passwordHash)
    if (!ok) throw new HttpError(401, 'Invalid email or password. Need an account? Sign up first.', { code: 'INVALID_CREDENTIALS' })

    const accessToken = signAccessToken(user.id)
    const { token: refreshToken, rti } = createRefreshToken(user.id)

    user.refreshTokenHash = await hashToken(rti)
    user.refreshTokenIssuedAt = new Date()
    await user.save()

    res.cookie('refresh_token', refreshToken, refreshCookieOptions())

    return res.json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        department: user.department,
        year: user.year,
        rollNumber: user.rollNumber,
        email: user.email,
        mobileNumber: user.mobileNumber,
        skills: user.skills,
        experience: user.experience,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        joinedCommunity: user.joinedCommunity,
        reputationScore: user.reputationScore,
        contributionCount: user.contributionCount,
        acceptedAnswersCount: user.acceptedAnswersCount,
      },
    })
  } catch (err) {
    return next(err)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined
    if (!token) return res.status(200).json({ accessToken: null })

    let payload: { sub: string; rti: string }
    try {
      payload = verifyRefreshToken(token)
    } catch {
      return res.status(200).json({ accessToken: null })
    }

    const user = await User.findById(payload.sub).select('+refreshTokenHash +refreshTokenIssuedAt')
    if (!user?.refreshTokenHash) return res.status(200).json({ accessToken: null })

    const ok = await compareToken(payload.rti, user.refreshTokenHash)
    if (!ok) return res.status(200).json({ accessToken: null })

    const accessToken = signAccessToken(user.id)
    return res.json({ accessToken })
  } catch (err) {
    return next(err)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token as string | undefined
    if (token) {
      try {
        const payload = verifyRefreshToken(token)
        await User.findByIdAndUpdate(payload.sub, { $set: { refreshTokenHash: null, refreshTokenIssuedAt: null } })
      } catch {
        // ignore
      }
    }

    res.clearCookie('refresh_token', { ...refreshCookieOptions(), maxAge: 0 })
    return res.json({ message: 'Logged out' })
  } catch (err) {
    return next(err)
  }
})

router.get('/me', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.userId).lean()
    if (!user) throw new HttpError(404, 'User not found', { code: 'USER_NOT_FOUND' })

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        department: user.department,
        year: user.year,
        rollNumber: user.rollNumber,
        email: user.email,
        mobileNumber: user.mobileNumber,
        skills: user.skills,
        experience: user.experience,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        joinedCommunity: user.joinedCommunity,
        reputationScore: user.reputationScore,
        contributionCount: user.contributionCount,
        acceptedAnswersCount: user.acceptedAnswersCount,
      },
    })
  } catch (err) {
    return next(err)
  }
})

router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    if (!userId) throw new HttpError(400, 'User ID is required')
    
    const user = await User.findById(userId).lean()
    if (!user) throw new HttpError(404, 'User not found', { code: 'USER_NOT_FOUND' })

    return res.json({
      id: user._id.toString(),
      name: user.name,
      department: user.department,
      year: user.year,
      rollNumber: user.rollNumber,
      email: user.email,
      mobileNumber: user.mobileNumber,
      skills: user.skills,
      experience: user.experience,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      joinedCommunity: user.joinedCommunity,
      reputationScore: user.reputationScore,
      contributionCount: user.contributionCount,
      acceptedAnswersCount: user.acceptedAnswersCount,
    })
  } catch (err) {
    return next(err)
  }
});

export default router;


