import mongoose, { Schema, Types } from 'mongoose'

export interface IAnswer {
  questionId: Types.ObjectId
  authorId: Types.ObjectId
  body: string
  isAccepted: boolean
  likesCount: number
  rating?: number
  averageRating: number
  totalRatings: number

  createdAt: Date
  updatedAt: Date
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true, ref: 'Question', index: true },
    authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    body: { type: String, required: true, trim: true, minlength: 10, maxlength: 20000 },
    isAccepted: { type: Boolean, default: false, index: true },
    likesCount: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema)

