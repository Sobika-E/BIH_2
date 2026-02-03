import mongoose, { Schema } from 'mongoose'

export type UserYear = 1 | 2 | 3 | 4

export interface IUser {
  name: string
  department: string
  year: UserYear
  rollNumber: string
  email: string
  mobileNumber: string
  passwordHash: string

  skills: string[]
  experience: string

  githubUrl?: string
  linkedinUrl?: string
  joinedCommunity: boolean

  reputationScore: number
  contributionCount: number
  acceptedAnswersCount: number
  totalRatingsReceived: number
  averageRating: number

  refreshTokenHash?: string | null
  refreshTokenIssuedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    department: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    year: { type: Number, required: true, min: 1, max: 4 },
    rollNumber: { type: String, required: true, trim: true, minlength: 2, maxlength: 40, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    mobileNumber: { type: String, required: true, trim: true, minlength: 10, maxlength: 15 },
    passwordHash: { type: String, required: true, select: false },

    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    joinedCommunity: { type: Boolean, default: false },

    reputationScore: { type: Number, default: 0 },
    contributionCount: { type: Number, default: 0 },
    acceptedAnswersCount: { type: Number, default: 0 },
    totalRatingsReceived: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },

    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenIssuedAt: { type: Date, default: null, select: false },
  },
  { timestamps: true },
)

export const User = mongoose.model<IUser>('User', userSchema)

