import mongoose, { Schema, Types } from 'mongoose'

export type QuestionCategory =
  | 'Subjects'
  | 'Placements'
  | 'Exams'
  | 'Labs'
  | 'Projects'
  | 'NSS / Activities'

export interface IQuestion {
  title: string
  description: string
  category: QuestionCategory
  tags: string[]

  authorId: Types.ObjectId
  answersCount: number
  acceptedAnswerId?: Types.ObjectId | null
  likesCount: number
  followerCount: number
  followers: Types.ObjectId[]

  createdAt: Date
  updatedAt: Date
}

const questionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true, trim: true, minlength: 10, maxlength: 160 },
    description: { type: String, required: true, trim: true, minlength: 30, maxlength: 20000 },
    category: {
      type: String,
      required: true,
      enum: ['Subjects', 'Placements', 'Exams', 'Labs', 'Projects', 'NSS / Activities'],
      index: true,
    },
    tags: { type: [String], default: [], index: true },

    authorId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    answersCount: { type: Number, default: 0 },
    acceptedAnswerId: { type: Schema.Types.ObjectId, default: null, ref: 'Answer' },
    likesCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    followers: { type: [Schema.Types.ObjectId], default: [], ref: 'User' },
  },
  { timestamps: true },
)

questionSchema.index({ title: 'text', description: 'text', tags: 'text' })

export const Question = mongoose.model<IQuestion>('Question', questionSchema)

