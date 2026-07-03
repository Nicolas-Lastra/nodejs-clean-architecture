export class UpdateMovieUseCase {
  constructor ({ moviesRepository }) {
    this.moviesRepository = moviesRepository
  }

  async execute ({ id, input }) {
    const existingMovie = await this.moviesRepository.getById(id)
    if (!existingMovie || existingMovie.length === 0) throw new Error(`Movie with id: ${id} not found`)
    const updatedMovie = await this.moviesRepository.update(id, input)
    return updatedMovie
  }
}
