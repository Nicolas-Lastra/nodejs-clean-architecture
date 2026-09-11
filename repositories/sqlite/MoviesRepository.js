import { MovieMapper } from '../../mappers/MovieMapper.js'
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
    await db.batch([
      { sql: 'PRAGMA foreign_keys = ON; -- Activa claves foráneas' },
      { sql: 'DROP TABLE IF EXISTS movies;' },
      {
        sql: `
        CREATE TABLE movies (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          year INTEGER NOT NULL,
          director TEXT NOT NULL,
          duration INTEGER NOT NULL,
          poster TEXT,
          rate REAL CHECK (rate >= 0 AND rate <= 10.0)
        );`
      },
      { sql: 'DROP TABLE IF EXISTS genres;' },
      {
        sql: `
        CREATE TABLE genres (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );`
      },
      { sql: 'DROP TABLE IF EXISTS movies_genres;' },
      {
        sql: `
        CREATE TABLE movies_genres (
          movie_id TEXT NOT NULL,
          genre_id INTEGER,
          PRIMARY KEY (movie_id, genre_id),
          FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
          FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL
        );`
      },
      {
        sql: `
        INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES
        ('0695d6bd-47ec-11f1-b23d-000e0986bd5b', 'Inception', 2010, 'Christopher Nolan', 148, 'https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_UF1000,1000_QL80_.jpg', 8.8),
        ('0695da61-47ec-11f1-b23d-000e0986bd5b', 'The Shawshank Redemption', 1994, 'Frank Darabont', 142, 'https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp', 9.3),
        ('0695db17-47ec-11f1-b23d-000e0986bd5b', 'The Dark Knight', 2008, 'Christopher Nolan', 152, 'https://i.ebayimg.com/images/g/yokAAOSw8w1YARbm/s-l1200.jpg', 9.0);
        `
      },
      {
        sql: `
        INSERT INTO genres (name) VALUES
        ('Action'),
        ('Adventure'),
        ('Comedy'),
        ('Crime'),
        ('Drama'),
        ('Fantasy'),
        ('Horror'),
        ('Thriller'),
        ('Sci-Fi'),
        ('Romance'),
        ('Biography'),
        ('Music'),
        ('Gangster Movies'),
        ('ClassicScifi'),
        ('Family'),
        ('Sport'),
        ('romcom'),
        ('Disaster Movies'),
        ('Dog Movies'),
        ('History'),
        ('Sports films'),
        ('animation'),
        ('martial arts'),
        ('war'),
        ('Mystery'),
        ('Documentary');
        `
      },
      {
        sql: `
        INSERT INTO movies_genres (movie_id, genre_id)
        VALUES
            ((SELECT id FROM movies WHERE title = 'Inception'), (SELECT id FROM genres WHERE name = 'Action')),
            ((SELECT id FROM movies WHERE title = 'Inception'), (SELECT id FROM genres WHERE name = 'Adventure')),
            ((SELECT id FROM movies WHERE title = 'Inception'), (SELECT id FROM genres WHERE name = 'Sci-Fi')),
            ((SELECT id FROM movies WHERE title = 'The Shawshank Redemption'), (SELECT id FROM genres WHERE name = 'Drama')),
            ((SELECT id FROM movies WHERE title = 'The Dark Knight'), (SELECT id FROM genres WHERE name = 'Action')),
            ((SELECT id FROM movies WHERE title = 'The Dark Knight'), (SELECT id FROM genres WHERE name = 'Crime')),
            ((SELECT id FROM movies WHERE title = 'The Dark Knight'), (SELECT id FROM genres WHERE name = 'Drama'));`
      }
    ], 'write')
  }

  async getAll ({ genres }) {
    if (genres) {
      let query = ''
      const queryArgs = []
      const baseQuery = `
      SELECT
          m.id,
          m.title,
          m.year,
          m.director,
          m.duration,
          m.poster,
          m.rate,
          GROUP_CONCAT(g.name, ',') AS genres
      FROM movies m
      LEFT JOIN movies_genres mg
      ON m.id = mg.movie_id
      LEFT JOIN genres g
      ON mg.genre_id = g.id
      WHERE EXISTS (
          SELECT 1
          FROM movies_genres mg2
          JOIN genres g2
          ON mg2.genre_id = g2.id
          WHERE mg2.movie_id = m.id AND LOWER(g2.name) = ?
      )
      GROUP BY m.id
      `

      genres.forEach(genre => {
        query += baseQuery
        query += '\nUNION\n'
        queryArgs.push(genre.toLowerCase())
      })

      query = query.trimEnd()
      query = query.replace(/\s+\S+$/, ';')

      const moviesWithGenresFilterResult = await db.execute({
        sql: query,
        args: queryArgs
      })

      const moviesWithGenresFilter = moviesWithGenresFilterResult.rows
      return moviesWithGenresFilter.map(movie => MovieMapper.toDomain(movie))
    }

    const queryResult = await db.execute({
      sql: `
      SELECT
        m.id,
        m.title,
        m.year,
        m.director,
        m.duration,
        m.poster,
        m.rate,
        GROUP_CONCAT(g.name, ',') AS genres
      FROM movies m
      LEFT JOIN movies_genres mg
      ON m.id = mg.movie_id
      LEFT JOIN genres g
      ON mg.genre_id = g.id
      GROUP BY m.id;
      `
    })

    const moviesResult = queryResult.rows
    const movies = moviesResult.map(movie => MovieMapper.toDomain(movie))
    return movies
  }

  async getById (id) {
    const movieResult = await db.execute({
      sql: `
      SELECT
        m.id,
        m.title,
        m.year,
        m.director,
        m.duration,
        m.poster,
        m.rate,
        GROUP_CONCAT(g.name, ',') AS genres
      FROM movies m
      LEFT JOIN movies_genres mg
      ON m.id = mg.movie_id
      LEFT JOIN genres g
      ON mg.genre_id = g.id
      WHERE m.id = ?
      GROUP BY m.id;
    `,
      args: [id]
    })

    const movie = MovieMapper.toDomain(movieResult.rows[0])
    return movie
  }

  async getByTitle (title) {
    const movieResult = await db.execute({
      sql: `
      SELECT
        m.id,
        m.title,
        m.year,
        m.director,
        m.duration,
        m.poster,
        m.rate,
        GROUP_CONCAT(g.name, ',') AS genres
      FROM movies m
      LEFT JOIN movies_genres mg
      ON m.id = mg.movie_id
      LEFT JOIN genres g
      ON mg.genre_id = g.id
      WHERE m.title = ?
      GROUP BY m.id;
    `,
      args: [title]
    })

    const movie = MovieMapper.toDomain(movieResult.rows[0])
    return movie
  }

  async create (movie) {
    const movieData = MovieMapper.toPersistence(movie)
    const { id, title, year, director, duration, poster, rate } = movieData.movie
    const genres = movieData.genres

    // Insert movie in movies table
    await db.execute({
      sql: `INSERT INTO movies (id, title, year, director, duration, poster, rate)
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
      args: [id, title, year, director, duration, poster, rate]
    })

    // Genres assignment
    const genresArgs = []
    let query = `INSERT INTO movies_genres (movie_id, genre_id)
    VALUES
    `

    if (genres) {
      genres.forEach(genre => {
        query += '(?, (SELECT id FROM genres WHERE name = ?)),\n'
        genresArgs.push(id, genre)
      })
      query = query.trimEnd()
      query = query.replace(/.$/, ';')

      await db.execute({
        sql: query,
        args: genresArgs
      })
    }

    // Return created movie from database
    const createdMovie = await this.getById(id)
    if (!createdMovie) throw new Error('Error obtaining created movie from the database')
    return createdMovie // this.getById() ya retorna una instancia de Movie
  }

  async update (id, input) {
    const { movieFields, hasGenres, genres } = MovieMapper.toPersistenceUpdate(input)
    const statements = [] // For transaction (BEGIN TRANSACTION; ...; COMMIT;)
    const movieEntries = Object.entries(movieFields)

    if (movieEntries.length > 0) {
      const setClause = movieEntries
        .map(([column]) => `${column} = ?`)
        .join(', ')

      const args = movieEntries.map(([, value]) => value)

      statements.push({
        sql: `UPDATE movies SET ${setClause} WHERE id = ?;`,
        args: [...args, id]
      })
    }

    if (hasGenres) {
      statements.push({
        sql: 'DELETE FROM movies_genres WHERE movie_id = ?;',
        args: [id]
      })

      if (genres.length > 0) {
        let genresQuery = 'INSERT INTO movies_genres (movie_id, genre_id) VALUES '
        const genresArgs = []

        genres.forEach(genre => {
          genresQuery += '(?, (SELECT id FROM genres WHERE name = ?)), '
          genresArgs.push(id, genre)
        })

        genresQuery = genresQuery.trimEnd()
        genresQuery = genresQuery.replace(/.$/, ';')

        statements.push({
          sql: genresQuery,
          args: genresArgs
        })
      }
    }

    if (statements.length > 0) {
      await db.batch(statements, 'write')
    }

    const updatedMovie = await this.getById(id)
    return updatedMovie
  }

  async delete (id) {
    try {
      await db.execute({
        sql: 'DELETE FROM movies WHERE id = ?;',
        args: [id]
      })
    } catch (error) {
      console.error('Error deleting movie in repository.')
    }
  }
}
