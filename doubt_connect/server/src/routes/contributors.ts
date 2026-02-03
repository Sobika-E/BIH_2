import { Router } from 'express'
import { z } from 'zod'
import { authRequired } from '../middleware/authRequired'
import { User } from '../models/User'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const sortBy = z.enum(['reputation', 'accepted', 'contributions']).catch('reputation').parse(req.query.sortBy)
    const year = typeof req.query.year === 'string' ? Number(req.query.year) : undefined
    const skills = typeof req.query.skills === 'string' ? req.query.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined

    const filter: Record<string, unknown> = {}
    if (year && [1, 2, 3, 4].includes(year)) filter.year = year
    
    // Add skills filter if provided
    if (skills && skills.length > 0) {
      filter.skills = { $in: skills }
    }

    const sort =
      sortBy === 'accepted'
        ? ({ acceptedAnswersCount: -1, reputationScore: -1 } as Record<string, 1 | -1>)
        : sortBy === 'contributions'
          ? ({ contributionCount: -1, reputationScore: -1 } as Record<string, 1 | -1>)
          : ({ reputationScore: -1, acceptedAnswersCount: -1 } as Record<string, 1 | -1>)

    const users = await User.find(filter).sort(sort).limit(50).lean()

    return res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        department: u.department,
        year: u.year,
        skills: u.skills,
        experience: u.experience,
        reputationScore: u.reputationScore,
        contributionCount: u.contributionCount,
        acceptedAnswersCount: u.acceptedAnswersCount,
      })),
    })
  } catch (err) {
    return next(err)
  }
})

// Leaderboard endpoint
router.get('/leaderboard', authRequired, async (req, res, next) => {
  try {
    // Sort users by reputation score, then by average rating, then by contributions
    const users = await User.find({})
      .sort({
        reputationScore: -1,
        averageRating: -1,
        contributionCount: -1
      })
      .limit(50)
      .lean()

    return res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        department: u.department,
        year: u.year,
        skills: u.skills,
        experience: u.experience,
        reputationScore: u.reputationScore,
        contributionCount: u.contributionCount,
        acceptedAnswersCount: u.acceptedAnswersCount,
        totalRatingsReceived: u.totalRatingsReceived,
        averageRating: u.averageRating,
      })),
    })
  } catch (err) {
    return next(err)
  }
})

export default router

