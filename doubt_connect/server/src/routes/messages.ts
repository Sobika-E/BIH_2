import { Router } from 'express'
import { z } from 'zod'
import { authRequired } from '../middleware/authRequired'
import { Message } from '../models/Message'
import { User } from '../models/User'
import { HttpError } from '../utils/httpError'

const router = Router()

// Get conversations (list of users you've messaged or who've messaged you)
router.get('/conversations', authRequired, async (req, res, next) => {
  try {
    const userId = req.userId!
    
    // Get all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .lean()
    
    // Get unique conversation partners
    const conversationPartners = new Set<string>()
    messages.forEach(msg => {
      if (msg.senderId !== userId) {
        conversationPartners.add(msg.senderId)
      }
      if (msg.recipientId !== userId) {
        conversationPartners.add(msg.recipientId)
      }
    })
    
    // Get user details for conversation partners
    const partners = await User.find({
      _id: { $in: Array.from(conversationPartners) }
    }).select('name department year skills').lean()
    
    // Add unread message counts
    const conversations = await Promise.all(partners.map(async (partner) => {
      const unreadCount = await Message.countDocuments({
        senderId: partner._id.toString(),
        recipientId: userId,
        read: false
      })
      
      return {
        id: partner._id.toString(),
        name: partner.name,
        department: partner.department,
        year: partner.year,
        skills: partner.skills,
        unreadCount,
        lastMessage: messages.find(msg => 
          (msg.senderId === partner._id.toString() && msg.recipientId === userId) ||
          (msg.recipientId === partner._id.toString() && msg.senderId === userId)
        )
      }
    }))
    
    return res.json({ conversations })
  } catch (err) {
    return next(err)
  }
})

// Get messages with a specific user
router.get('/with/:userId', authRequired, async (req, res, next) => {
  try {
    const currentUserId = req.userId!
    const otherUserId = req.params.userId
    
    // Validate that the other user exists
    const otherUser = await User.findById(otherUserId).select('name department year skills').lean()
    if (!otherUser) {
      throw new HttpError(404, 'User not found')
    }
    
    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .lean()
    
    // Mark messages as read where current user is recipient
    await Message.updateMany(
      { 
        recipientId: currentUserId, 
        senderId: otherUserId, 
        read: false 
      },
      { read: true }
    )
    
    return res.json({
      user: {
        id: otherUser._id.toString(),
        name: otherUser.name,
        department: otherUser.department,
        year: otherUser.year,
        skills: otherUser.skills
      },
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        senderId: msg.senderId,
        content: msg.content,
        read: msg.read,
        createdAt: msg.createdAt
      }))
    })
  } catch (err) {
    return next(err)
  }
})

// Send a message
router.post('/send', authRequired, async (req, res, next) => {
  try {
    const schema = z.object({
      recipientId: z.string().min(1),
      content: z.string().min(1).max(1000)
    })
    
    const data = schema.parse(req.body)
    const senderId = req.userId!
    
    // Validate recipient exists
    const recipient = await User.findById(data.recipientId)
    if (!recipient) {
      throw new HttpError(404, 'Recipient not found')
    }
    
    // Don't allow messaging yourself
    if (data.recipientId === senderId) {
      throw new HttpError(400, 'Cannot message yourself')
    }
    
    // Create message
    const message = await Message.create({
      senderId,
      recipientId: data.recipientId,
      content: data.content.trim()
    })
    
    return res.status(201).json({
      message: {
        id: message._id.toString(),
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt
      }
    })
  } catch (err) {
    return next(err)
  }
})

// Get unread message count
router.get('/unread-count', authRequired, async (req, res, next) => {
  try {
    const userId = req.userId!
    
    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      read: false
    })
    
    return res.json({ unreadCount })
  } catch (err) {
    return next(err)
  }
})

export default router