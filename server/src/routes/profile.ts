import { Router } from 'express'
import { z } from 'zod'
import { authRequired, type AuthedRequest } from '../middleware/authRequired'
import { User } from '../models/User'
import { HttpError } from '../utils/httpError'

const router = Router()

const profileSchema = z.object({
  skills: z.array(z.string().trim().min(2).max(40)).max(20),
  experience: z.string().trim().max(2000),
  githubUrl: z
    .string()
    .trim()
    .url('GitHub URL must be valid')
    .max(200)
    .or(z.literal(''))
    .optional(),
  linkedinUrl: z
    .string()
    .trim()
    .url('LinkedIn URL must be valid')
    .max(200)
    .or(z.literal(''))
    .optional(),
})

router.patch('/me', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const data = profileSchema.parse(req.body)

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          skills: data.skills,
          experience: data.experience,
          githubUrl: data.githubUrl ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
        },
      },
      { new: true },
    ).lean()

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
        reputationScore: user.reputationScore,
        contributionCount: user.contributionCount,
        acceptedAnswersCount: user.acceptedAnswersCount,
      },
    })
  } catch (err) {
    return next(err)
  }
})

export default router

