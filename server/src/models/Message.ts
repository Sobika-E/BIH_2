import mongoose, { Schema } from 'mongoose'

export interface IMessage {
  senderId: string
  recipientId: string
  content: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for efficient querying of conversations
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 })

export const Message = mongoose.model<IMessage>('Message', messageSchema)