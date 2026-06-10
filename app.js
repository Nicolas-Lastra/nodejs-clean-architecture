import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

// Auth
import { createAuthMiddleware } from './middlewares/authMiddleware.js'
import { createAuthRouter } from './routes/auth.routes.js'
import { AuthController } from './controllers/AuthController.js'
import { RegisterUserUseCase } from './services/auth/RegisterUserUseCase.js'
import { LoginUserUseCase } from './services/auth/LoginUserUseCase.js'
import { IdGenerator } from './utils/IdGenerator.js'
import { PasswordHasher } from './utils/PasswordHasher.js'
import { TokenService } from './utils/TokenService.js'
import { corsMiddleware } from './middlewares/corsMiddleware.js'

// Movies
import { GetAllMoviesUseCase } from './services/movies/GetAllMoviesUseCase.js'
import { GetMovieUseCase } from './services/movies/GetMovieUseCase.js'
import { CreateMovieUseCase } from './services/movies/CreateMovieUseCase.js'
import { UpdateMovieUseCase } from './services/movies/UpdateMovieUseCase.js'
import { MoviesController } from './controllers/MoviesController.js'
import { createsMovieRouter } from './routes/movies.routes.js'

export const createApp = ({ userRepository, moviesRepository }) => {
  const app = express()

  // Middlewares
  app.use(json())
  app.use(corsMiddleware())
  app.use(cookieParser())

  // Config
  app.disable('x-powered-by')

  // Dependencies
  const idGenerator = new IdGenerator()
  const saltRounds = parseInt(process.env.SALT_ROUNDS) ?? 10
  const passwordHasher = new PasswordHasher({ saltRounds })
  const tokenService = new TokenService({ secret: process.env.SECRET_JWT_KEY, expiresIn: process.env.EXPIRES_IN })
  const authMiddleware = createAuthMiddleware({ tokenService })

  // Auth Use cases
  const registerUserUseCase = new RegisterUserUseCase({ userRepository, idGenerator, passwordHasher })
  const loginUserUseCase = new LoginUserUseCase({ userRepository, passwordHasher, tokenService })

  // Auth Controllers
  const authController = new AuthController({ registerUserUseCase, loginUserUseCase })
  const authRouter = createAuthRouter({ authController, authMiddleware })

  // Movies Use Cases
  const getAllMoviesUseCase = new GetAllMoviesUseCase({ moviesRepository })
  const getMovieUseCase = new GetMovieUseCase({ moviesRepository })
  const createMovieUseCase = new CreateMovieUseCase({ moviesRepository, idGenerator })
  const updateMovieUseCase = new UpdateMovieUseCase({ moviesRepository })

  // Movies controllers
  const moviesController = new MoviesController({ getAllMoviesUseCase, getMovieUseCase, createMovieUseCase, updateMovieUseCase })
  const moviesRouter = createsMovieRouter({ moviesController, authMiddleware })

  app.get('/', (req, res) => {
    res.json({ message: 'Holanda!' })
  })

  app.use('/auth', authRouter)
  app.use('/movies', moviesRouter)

  return app
}
