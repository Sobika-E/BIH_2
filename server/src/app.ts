import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { env } from './config/env'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import questionsRoutes from './routes/questions'
import contributorsRoutes from './routes/contributors'
import profileRoutes from './routes/profile'
import membershipRoutes from './routes/membership'
import messagesRoutes from './routes/messages'
import notificationsRoutes from './routes/notifications'
import followRoutes from './routes/follow'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  )

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use(express.json({ limit: '200kb' }))
  app.use(cookieParser())

  app.get('/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/questions', questionsRoutes)
  app.use('/api/contributors', contributorsRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/membership', membershipRoutes)
  app.use('/api/messages', messagesRoutes)
  app.use('/api/notifications', notificationsRoutes)
  app.use('/api/follow', followRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

