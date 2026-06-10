import { Movie } from '../../models/Movie.js'

export class CreateMovieUseCase {
  constructor ({ moviesRepository, idGenerator }) {
    this.moviesRepository = moviesRepository
    this.idGenerator = idGenerator
  }

  async execute ({ title, year, director, duration, poster, rate, genres }) {
    const id = await this.idGenerator.generate()
    const movieExists = await this.moviesRepository.getByTitle(title)
    if (movieExists || movieExists.length > 0) throw new Error('A movie with this title already exists')

    const movie = new Movie({ id, title, year, director, duration, poster, rate })
    const createdMovieWithGenres = await this.moviesRepository.create(movie, genres)

    return createdMovieWithGenres
  }
}
