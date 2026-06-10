import { MoviesRepositoryInterface } from '../../contracts/MoviesRepositoryInterface.js'
import { createClient } from '@libsql/client'

// Local file db
const db = createClient({
  url: 'file:sqlite-db.db'
})

// Para conectar con base de datos hosteada en Turso
// Comentar local file db y descomentar lo abajo

// Turso db
// const db = createClient({
//   url: process.env.DB_URL,
//   authToken: process.env.DB_TOKEN
// })

// Recuerda crear el archivo .env en la raíz del proyecto

export class MoviesRepository extends MoviesRepositoryInterface {
  async init () {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS movies (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        year INTEGER NOT NULL,
        director TEXT NOT NULL,
        duration INTEGER NOT NULL,
        poster TEXT,
        rate REAL NOT NULL CHECK (rate >= 0 AND rate <= 10.0)
      );
    `)
  }

  async getAll ({ genres }) {
    if (genres) {
      let query = ''
      const queryArgs = []
      const baseQuery = `SELECT m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate
      FROM movies m
      JOIN movies_genres mg
      ON m.id = mg.movie_id AND mg.genre_id = (SELECT id FROM genres WHERE LOWER(name) = ?)`

      genres.forEach(genre => {
        query += baseQuery
        query += '\nUNION\n'
        queryArgs.push(genre.toLowerCase())
      })

      const interQuery = query.trimEnd()
      const finalQuery = interQuery.replace(/\s+\S+$/, ';')

      const moviesWithGenresResult = await db.execute({
        sql: finalQuery,
        args: queryArgs
      })

      const moviesWithGenres = moviesWithGenresResult.rows
      return moviesWithGenres
    }

    const queryResult = await db.execute({
      sql: 'SELECT * FROM movies'
    })

    const movies = queryResult.rows
    return movies
  }

  async getById (id) {
    const movieResult = await db.execute({
      sql: 'SELECT * FROM movies WHERE id = ?;',
      args: [id]
    })

    const movie = movieResult.rows
    return movie
  }

  async getByTitle (title) {
    const movieResult = await db.execute({
      sql: 'SELECT * FROM movies WHERE title = ?;',
      args: [title]
    })

    const movie = movieResult.rows
    return movie
  }

  async create (movie, genres) {
    const { id, title, year, director, duration, poster, rate } = movie.toPrimitives()

    // Insert movie in movies table
    await db.execute({
      sql: `INSERT INTO movies (id, title, year, director, duration, poster, rate)
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
      args: [id, title, year, director, duration, poster, rate]
    })

    // Return created movie from database
    const createdMovie = await db.execute({
      sql: 'SELECT * FROM movies WHERE id = ?;',
      args: [id]
    })
    if (!createdMovie) throw new Error('Error obtaining created movie from the database')

    // Genres assignment
    const baseQUery = `INSERT INTO movies_genres (movie_id, genre_id)
    VALUES
    `
    const genresArgs = []
    let query = ''
    query += baseQUery

    if (genres) {
      genres.forEach(genre => {
        query += '(?, (SELECT id FROM genres WHERE name = ?)),\n'
        genresArgs.push(id)
        genresArgs.push(genre)
      })
      const interQuery = query.trimEnd()
      const finalQuery = interQuery.replace(/.$/, ';')

      await db.execute({
        sql: finalQuery,
        args: genresArgs
      })

      return { ...createdMovie.rows[0], genres }
    }

    return { ...createdMovie.rows[0], genres: [] }
  }

  async update (id, input) {
    const statements = [] // For transaction (BEGIN TRANSACTION; ...; COMMIT;)

    let query = 'UPDATE movies SET'
    const queryArgs = []

    for (const [key, value] of Object.entries(input)) {
      if (key === 'title') query += ' title = ?,'
      if (key === 'year') query += ' year = ?,'
      if (key === 'director') query += ' director = ?,'
      if (key === 'duration') query += ' duration = ?,'
      if (key === 'poster') query += ' poster = ?,'
      if (key === 'rate') query += ' rate = ?,'

      if (key !== 'genres') {
        queryArgs.push(value)
      }
    }

    queryArgs.push(id)
    const interQuery = query.replace(/.$/, '')
    const finalQuery = interQuery + '\n' + 'WHERE id = ?;'

    statements.push({
      sql: finalQuery,
      args: queryArgs
    })

    // Genres assignment
    if (Object.hasOwn(input, 'genres')) {
      statements.push({
        sql: 'DELETE FROM movies_genres WHERE movie_id = ?;',
        args: [id]
      })

      const genres = input.genres
      const genresArgs = []

      // let genresQuery = 'BEGIN TRANSACTION;\nDELETE FROM movies_genres WHERE movie_id = ?;\n'
      let genresQuery = 'INSERT INTO movies_genres (movie_id, genre_id)\nVALUES\n'

      genres.forEach(genre => {
        genresQuery += '(?, (SELECT id FROM genres WHERE name = ?)),\n'
        genresArgs.push(id)
        genresArgs.push(genre)
      })

      const interGenresQuery = genresQuery.trimEnd()
      const finalGenresQuery = interGenresQuery.replace(/.$/, ';')

      statements.push({
        sql: finalGenresQuery,
        args: genresArgs
      })
    }

    // Transaction
    try {
      await db.batch(statements, 'write')
    } catch (error) {
      console.error('Error updating movie genres. Transaction query not commited.')
    }

    // Return updated movie from database
    try {
      const updatedResult = await db.execute({
        sql: 'SELECT * FROM movies WHERE id = ?;',
        args: [id]
      })

      if (!updatedResult) throw new Error('Error obtaining updated movie from the database')
      const updatedMovie = updatedResult.rows

      if (Object.hasOwn(input, 'genres')) {
        const genresInput = input.genres
        return { ...updatedMovie, genresInput }
      }
      return updatedMovie
    } catch (error) {
      console.error('Error returning updated movie from repository')
    }
  }

  async delete (id) {
    throw new Error('Method not immplemented')
  }
}
