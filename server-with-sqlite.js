import { createApp } from './app.js'
import { MoviesRepository } from './repositories/sqlite/MoviesRepository.js'
import { UserRepository } from './repositories/sqlite/UserRepository.js'
import 'dotenv/config'

const userRepository = new UserRepository()
await userRepository.init()

const moviesRepository = new MoviesRepository()
await moviesRepository.init()

const app = createApp({ userRepository, moviesRepository })

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
