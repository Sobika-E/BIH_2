import { Router } from 'express'
import { authRequired, type AuthedRequest } from '../middleware/authRequired'
import { Notification } from '../models/Notification'
import { HttpError } from '../utils/httpError'

const router = Router()

// Get all notifications for current user
router.get('/', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    
    return res.json({
      notifications: notifications.map(n => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        entityId: n.entityId,
        createdAt: n.createdAt,
      }))
    })
  } catch (err) {
    return next(err)
  }
})

// Get unread notifications count
router.get('/unread-count', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.userId, 
      read: false 
    })
    
    return res.json({ unreadCount: count })
  } catch (err) {
    return next(err)
  }
})

// Mark notification as read
router.patch('/:notificationId/read', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.userId },
      { read: true },
      { new: true }
    )
    
    if (!notification) {
      throw new HttpError(404, 'Notification not found')
    }
    
    return res.json({
      id: notification._id.toString(),
      read: notification.read
    })
  } catch (err) {
    return next(err)
  }
})

// Mark all notifications as read
router.patch('/read-all', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    )
    
    return res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    return next(err)
  }
})

// Delete notification
router.delete('/:notificationId', authRequired, async (req: AuthedRequest, res, next) => {
  try {
    const { notificationId } = req.params
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.userId
    })
    
    if (!notification) {
      throw new HttpError(404, 'Notification not found')
    }
    
    return res.json({ message: 'Notification deleted' })
  } catch (err) {
    return next(err)
  }
})

export default router