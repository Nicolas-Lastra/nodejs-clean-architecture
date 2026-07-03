export class DeleteMovieUseCase {
  constructor ({ moviesRepository }) {
    this.moviesRepository = moviesRepository
  }

  async execute ({ id }) {
    const movieExists = await this.moviesRepository.getById(id)
    if (!movieExists || movieExists.length === 0) throw new Error('Movie not found')
    try {
      await this.moviesRepository.delete(id)
    } catch (error) {
      console.error('Error deleting movie')
    }
  }
}
