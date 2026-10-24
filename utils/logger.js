import pino from 'pino'

export const logger = pino({
  level: 'info',
  transport: {
    target: 'pino/file',
    options: {
      destination: './logs/app.log',
      mkdir: true
    }
  }
})
