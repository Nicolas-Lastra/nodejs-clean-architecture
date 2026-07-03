import { User } from '../entities/User.js'

export const UserMapper = {
  toDomain (row) {
    if (!row) return null

    return new User({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email
    })
  },

  toPersistence (user) {
    const userData = user.toPrimitives()
    return {
      id: userData.id,
      username: userData.username,
      password_hash: userData.passwordHash,
      email: userData.email
    }
  }
}
