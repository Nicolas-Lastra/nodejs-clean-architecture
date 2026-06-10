export class GetAllMoviesUseCase {
  constructor ({ moviesRepository }) {
    this.moviesRepository = moviesRepository
  }

  async execute (genres) {
    const movies = await this.moviesRepository.getAll(genres)
    return movies
  }
}
