import { Result } from '../../utils/Result.js'

export class UpdateMovieUseCase {
  constructor ({ moviesRepository }) {
    this.moviesRepository = moviesRepository
  }

  async execute ({ id, input }) {
    if (!id) return Result.fail('INVALID_ID', 'Id is required.')
    if (!input) return Result.fail('INVALID_INPUT', 'Input is required.')
    const existingMovie = await this.moviesRepository.getById(id)
    if (!existingMovie) return Result.fail('NOT_FOUND', 'Movie not found.')
    const updatedMovie = await this.moviesRepository.update(id, input)
    return Result.ok(updatedMovie)
  }
}
