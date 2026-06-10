export class GetMovieUseCase {
  constructor ({ moviesRepository }) {
    this.moviesRepository = moviesRepository
  }

  async execute (id) {
    const movie = await this.moviesRepository.getById(id)
    return movie
  }
}
