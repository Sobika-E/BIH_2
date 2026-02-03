import { Router } from 'express'
import { authRequired, type AuthedRequest } from '../middleware/authRequired'
import { User } from '../models/User'
import { Question } from '../models/Question'
import { HttpError } from '../utils/httpError'

const router = Router()

// Follow a question
router.post('/question/:questionId', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const { questionId } = req.params
    const userId = req.userId
    
    // Check if question exists
    const question = await Question.findById(questionId)
    if (!question) {
      throw new HttpError(404, 'Question not found')
    }
    
    // Add user to question's followers if not already following
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { 
        $addToSet: { followers: userId },
        $inc: { followerCount: 1 }
      },
      { new: true }
    )
    
    return res.json({
      message: 'Successfully followed question',
      followerCount: updatedQuestion?.followerCount || 0
    })
  } catch (err) {
    return next(err)
  }
})

// Unfollow a question
router.delete('/question/:questionId', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const { questionId } = req.params
    const userId = req.userId
    
    // Remove user from question's followers
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { 
        $pull: { followers: userId },
        $inc: { followerCount: -1 }
      },
      { new: true }
    )
    
    return res.json({
      message: 'Successfully unfollowed question',
      followerCount: Math.max(0, updatedQuestion?.followerCount || 0)
    })
  } catch (err) {
    return next(err)
  }
})

// Check if user is following a question
router.get('/question/:questionId/is-following', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const { questionId } = req.params
    const userId = req.userId
    
    const question = await Question.findById(questionId)
    const isFollowing = question?.followers.includes(userId) || false
    
    return res.json({ isFollowing })
  } catch (err) {
    return next(err)
  }
})

// Get all questions followed by current user
router.get('/my-following', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.userId
    
    const questions = await Question.find({ followers: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', 'name department year')
      .lean()
    
    return res.json({
      questions: questions.map(q => ({
        id: q._id.toString(),
        title: q.title,
        descriptionPreview: q.description.substring(0, 150) + '...',
        category: q.category,
        tags: q.tags,
        createdAt: q.createdAt,
        answersCount: q.answersCount,
        followerCount: q.followerCount,
        author: q.author ? {
          id: q.author._id.toString(),
          name: q.author.name,
          year: q.author.year
        } : null
      }))
    })
  } catch (err) {
    return next(err)
  }
})

// Get followers count for a question
router.get('/question/:questionId/count', async (req, res, next) => {
  try {
    const { questionId } = req.params
    
    const question = await Question.findById(questionId)
    const count = question?.followerCount || 0
    
    return res.json({ followerCount: count })
  } catch (err) {
    return next(err)
  }
})

export default router