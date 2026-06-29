import { User } from '../models/User.js'

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

  toPersistance (user) {
    const userData = user.toPrimitives()
    return {
      id: userData.id,
      username: userData.username,
      passwordHash: userData.passwordHash,
      email: userData.email
    }
  },

  toPublicResponse (user) {
    const userData = user.toPublicData()
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email
    }
  }
}
