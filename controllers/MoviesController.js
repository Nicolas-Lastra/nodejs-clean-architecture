import { validateMovie, validatePartialMovie } from '../schemas/Movie.js'
import { MoviePresenter } from '../presenters/MoviePresenter.js'

export class MoviesController {
  constructor ({ getAllMoviesUseCase, getMovieUseCase, createMovieUseCase, updateMovieUseCase, deleteMovieUseCase }) {
    this.getAllMoviesUseCase = getAllMoviesUseCase
    this.getMovieUseCase = getMovieUseCase
    this.createMovieUseCase = createMovieUseCase
    this.updateMovieUseCase = updateMovieUseCase
    this.deleteMovieUseCase = deleteMovieUseCase
  }

  getAll = async (req, res, next) => {
    const genresResult = req.query.genres
    let genres
    if (typeof genresResult === 'string') {
      genres = [genresResult]
    } else {
      genres = genresResult
    }

    const movies = await this.getAllMoviesUseCase.execute({ genres })
    if (!movies || movies.length === 0) return res.status(404).json({ message: 'Movies not found' })
    res.status(200).json(MoviePresenter.toHttpList(movies))
  }

  getById = async (req, res, next) => {
    const { id } = req.params
    const movie = await this.getMovieUseCase.execute(id)
    if (!movie || movie.length === 0) return res.status(404).json({ message: 'Movie not found' })

    return res.status(200).json(MoviePresenter.toHttp(movie))
  }

  create = async (req, res, next) => {
    const result = validateMovie(req.body)
    if (result.error) return res.status(422).json({ message: 'Movie inputs could not be validated', error: JSON.parse(result.error.message) })

    const { title, year, director, duration, poster, rate } = result.data
    const { genres } = result.data
    try {
      const movieResult = await this.createMovieUseCase.execute({ title, year, director, duration, poster, rate, genres })
      if (!movieResult || movieResult.length === 0) return res.status(404).json({ message: 'createMoviesUseCase returned null or empty array' })
      return res.status(201).json(MoviePresenter.toHttp(movieResult))
    } catch (error) {
      return res.status(409).json({ error: error.message })
    }
  }

  update = async (req, res, next) => {
    const { id } = req.params

    const result = validatePartialMovie(req.body)
    if (result.error) return res.status(422).json({ error: 'Update inputs could not be validated' })

    try {
      const updateInput = result.data
      const updatedMovie = await this.updateMovieUseCase.execute({ id, input: updateInput })
      return res.status(200).json(MoviePresenter.toHttp(updatedMovie))
    } catch (error) {
      console.error('Error updating movie with the provided id')
      return res.status(404).json(error.message)
    }
  }

  delete = async (req, res, next) => {
    const { id } = req.params
    try {
      await this.deleteMovieUseCase.execute({ id })
      return res.sendStatus(204)
    } catch (error) {
      return res.status(404).json({ message: `Movie with id ${id} was not found` })
    }
  }
}
