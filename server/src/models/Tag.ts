import mongoose, { Schema } from 'mongoose'

export interface ITag {
  name: string
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Tag = mongoose.model<ITag>('Tag', tagSchema)

