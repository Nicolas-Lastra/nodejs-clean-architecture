import { MOVIE_GENRES } from './MovieGenres.js'

export class Movie {
  #id
  #title
  #year
  #director
  #duration
  #poster
  #rate
  #genres

  constructor ({ id, title, year, director, duration, poster, rate, genres = [] }) {
    if (!id) throw new Error('Id is required')
    if (!title) throw new Error('Title is required')
    if (!year) throw new Error('Year is required')
    if (!director) throw new Error('Director is required')
    if (!duration) throw new Error('Duration is required')
    if (!poster) throw new Error('Poster is required')
    // Rate is optional
    if (rate !== undefined && rate !== null && (rate < 0 || rate > 10)) {
      throw new Error('Rate must be between 0 and 10')
    }

    this.#id = id
    this.#title = title
    this.#year = year
    this.#director = director
    this.#duration = duration
    this.#poster = poster
    this.#rate = rate
    this.#genres = this.#validateGenres(genres)
  }

  #validateGenres (genres) {
    const uniqueGenres = [...new Set(genres)]

    for (const genre of uniqueGenres) {
      if (!MOVIE_GENRES.includes(genre)) {
        throw new Error(`Invalid genre: ${genre}`)
      }
    }

    return uniqueGenres
  }

  toPrimitives () {
    return {
      id: this.#id,
      title: this.#title,
      year: this.#year,
      director: this.#director,
      duration: this.#duration,
      poster: this.#poster,
      rate: this.#rate,
      genres: this.#genres
    }
  }

  toPublicData () {
    const publicMovie = {
      id: this.#id,
      title: this.#title,
      year: this.#year,
      director: this.#director,
      duration: this.#duration,
      poster: this.#poster,
      rate: this.#rate,
      genres: this.#genres
    }

    return publicMovie
  }
}
