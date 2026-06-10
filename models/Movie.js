export class Movie {
  #id
  #title
  #year
  #director
  #duration
  #poster
  #rate

  constructor ({ id, title, year, director, duration, poster, rate }) {
    if (!id) throw new Error('Id is required')
    if (!title) throw new Error('Title is required')
    if (!year) throw new Error('Year is required')
    if (!director) throw new Error('Director is required')
    if (!duration) throw new Error('Duration is required')
    if (!poster) throw new Error('Poster is required')
    // Rate is optional

    this.#id = id
    this.#title = title
    this.#year = year
    this.#director = director
    this.#duration = duration
    this.#poster = poster
    this.#rate = rate
  }

  toPrimitives () {
    return {
      id: this.#id,
      title: this.#title,
      year: this.#year,
      director: this.#director,
      duration: this.#duration,
      poster: this.#poster,
      rate: this.#rate
    }
  }

  toPublicData () {
    const publicMovie = {
      title: this.#title,
      year: this.#year,
      director: this.#director,
      duration: this.#duration,
      poster: this.#poster,
      rate: this.#rate
    }

    return publicMovie
  }
}
