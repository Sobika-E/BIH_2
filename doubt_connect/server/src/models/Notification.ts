import { model, Schema } from 'mongoose'

export interface INotification {
  _id: string
  userId: string
  type: 'question_answered' | 'answer_accepted' | 'new_follower' | 'mention'
  title: string
  message: string
  read: boolean
  entityId?: string // ID of the question/answer/etc
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      required: true,
      enum: ['question_answered', 'answer_accepted', 'new_follower', 'mention']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    entityId: { type: String },
  },
  { timestamps: true },
)

notificationSchema.index({ userId: 1, createdAt: -1 })

export const Notification = model<INotification>('Notification', notificationSchema)