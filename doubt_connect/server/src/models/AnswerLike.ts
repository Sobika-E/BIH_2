import mongoose, { Schema, Types } from 'mongoose'

export interface IAnswerLike {
  answerId: Types.ObjectId
  userId: Types.ObjectId
  rating?: number
  createdAt: Date
  updatedAt: Date
}

const answerLikeSchema = new Schema<IAnswerLike>(
  {
    answerId: { type: Schema.Types.ObjectId, required: true, ref: 'Answer', index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true },
)

answerLikeSchema.index({ answerId: 1, userId: 1 }, { unique: true })

export const AnswerLike = mongoose.model<IAnswerLike>('AnswerLike', answerLikeSchema)

