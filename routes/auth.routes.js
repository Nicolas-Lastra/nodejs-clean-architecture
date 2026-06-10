import { Router } from 'express'

export function createAuthRouter ({ authController, authMiddleware }) {
  const authRouter = Router()

  authRouter.post('/register', authController.register)
  authRouter.post('/login', authController.login)
  authRouter.post('/logout', authMiddleware, authController.logout)

  return authRouter
}
