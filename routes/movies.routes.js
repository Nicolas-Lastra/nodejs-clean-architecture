import { Router } from 'express'

export function createsMovieRouter ({ moviesController, authMiddleware }) {
  const moviesRouter = Router()

  moviesRouter.get('/', moviesController.getAll)
  moviesRouter.get('/:id', moviesController.getById)
  moviesRouter.post('/', authMiddleware, moviesController.create)
  moviesRouter.patch('/:id', authMiddleware, moviesController.update)
  // moviesRouter.delete('/:id', authMiddleware, moviesController.delete)

  return moviesRouter
}
