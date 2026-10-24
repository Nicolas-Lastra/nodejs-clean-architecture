import { logger } from '../utils/logger.js'

export const errorMiddleware = (err, req, res, next) => {
  logger.error({
    err,
    method: req.method,
    path: req.path
  }, 'Unhandled application error')

  if (res.headersSent) return next(err)

  return res.status(500).json({
    error: 'Internal server error.'
  })
}
