import cors from 'cors'
import 'dotenv/config'

const defaultOrigins = [
  'http://localhost:1234',
  'http://localhost3000'
]

const ACCEPTED_ORIGINS = process.env.ACCEPTED_ORIGINS ?? defaultOrigins

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by cors'))
  }
})
