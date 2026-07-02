import { Movie } from '../models/Movie.js'

export const MovieMapper = {
  toDomain (row) {
    if (!row) return null

    return new Movie({
      id: row.id,
      title: row.title,
      year: row.year,
      director: row.director,
      duration: row.duration,
      poster: row.poster,
      rate: row.rate,
      genres: row.genres ? row.genres.split(',') : []
    })
  },

  toPersistence (movie) {
    const movieData = movie.toPrimitives()

    return {
      movie: {
        id: movieData.id,
        title: movieData.title,
        year: movieData.year,
        director: movieData.director,
        duration: movieData.duration,
        poster: movieData.poster,
        rate: movieData.rate
      },
      genres: movieData.genres
    }
  },

  toPersistenceUpdate (input) {
    const movieFields = {}
    const hasGenres = Object.hasOwn(input, 'genres')

    const columnMap = {
      title: 'title',
      year: 'year',
      director: 'director',
      duration: 'duration',
      poster: 'poster',
      rate: 'rate'
    }

    for (const [key, value] of Object.entries(input)) {
      if (key === 'genres') continue

      const column = columnMap[key]
      if (column) movieFields[column] = value
    }

    return {
      movieFields,
      hasGenres,
      genres: hasGenres ? [...new Set(input.genres)] : undefined
    }
  },

  toPublicData (movie) {
    if (!movie) return null
    return movie.toPublicData()
  }
}
