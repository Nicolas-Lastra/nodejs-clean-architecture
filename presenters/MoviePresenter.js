export const MoviePresenter = {
  toHttp (movie) {
    return movie.toPublicData()
  },

  toHttpList (movies) {
    return movies.map(movie => this.toHttp(movie))
  }
}
