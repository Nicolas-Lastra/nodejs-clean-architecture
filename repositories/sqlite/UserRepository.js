import { User } from '../../models/User.js'
import { UserRepositoryInterface } from '../../contracts/UserRepositoryInterface.js' // Interfaz: contrato que deben seguir los repositorios
import { createClient } from '@libsql/client'

// local file db
const db = createClient({
  url: 'file:sqlite-db.db'
})

// Para conectar con base de datos hosteada en Turso
// Comentar local file db y descomentar lo debajo de turso db

// turso db
// const db = createClient({
//   url: process.env.DB_URL,
//   authToken: process.env.DB_TOKEN
// })

// Recuerda crear el archivo .env en la raíz del proyecto

function rowToUser (row) {
  if (!row) return null

  return new User({
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    email: row.email
  })
}

export class UserRepository extends UserRepositoryInterface {
  async init () {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
    `)
  }

  async findById (id) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?;',
      args: [id]
    })

    const user = rowToUser(result.rows[0])
    return user ?? null
  }

  async findByUsername (username) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?;',
      args: [username]
    })

    const user = rowToUser(result.rows[0])
    return user ?? null
  }

  async save (user) {
    const { id, username, passwordHash, email } = user.toPrimitives()
    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, email)
        VALUES (?, ?, ?, ?);
      `,
      args: [id, username, passwordHash, email]
    })
  }
}
