import { UserRepositoryInterface } from '../../contracts/UserRepositoryInterface.js' // Interfaz: contrato que deben seguir los repositorios
import { UserMapper } from '../../mappers/UserMapper.js'
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

export class UserRepository extends UserRepositoryInterface {
  async init () {
    await db.batch([
      { sql: 'DROP TABLE IF EXISTS users;' },
      {
        sql: `
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE
        );
      `
      },
      {
        sql: `INSERT INTO users (id, username, password_hash, email) 
        VALUES
        ('cd8b4fb4-6377-457a-800e-ff5d7a26e8bc' , 'usuario_prueba', '$2b$10$ZhMIBnpjNa71JqF840N5x.jhVHB8ot0ptsbTELPLZj9rcbIlIsgcO', 'usuario@prueba.com');`
      }
    ], 'write')
  }

  async findById (id) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?;',
      args: [id]
    })

    const user = UserMapper.toDomain(result.rows[0])
    return user ?? null
  }

  async findByUsername (username) {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?;',
      args: [username]
    })

    const user = UserMapper.toDomain(result.rows[0])
    return user ?? null
  }

  async save (user) {
    const userData = UserMapper.toPersistance(user)
    const { id, username, passwordHash, email } = userData
    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, email)
        VALUES (?, ?, ?, ?);
      `,
      args: [id, username, passwordHash, email]
    })
  }
}
