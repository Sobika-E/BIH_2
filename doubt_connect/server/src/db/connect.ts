import mongoose from 'mongoose'
import { env } from '../config/env'

export async function connectToDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.MONGODB_URI)
  return mongoose.connection
}

