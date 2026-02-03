import { Router } from 'express'
import { authRequired, type AuthedRequest } from '../middleware/authRequired'
import { User } from '../models/User'
import { HttpError } from '../utils/httpError'

const router = Router()

router.post('/join', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) throw new HttpError(404, 'User not found')
    if (!user.joinedCommunity) {
      user.joinedCommunity = true
      await user.save()
    }
    return res.json({ joinedCommunity: user.joinedCommunity })
  } catch (err) {
    return next(err)
  }
})

export default router

