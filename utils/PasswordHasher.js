import bcrypt from 'bcrypt'

export class PasswordHasher {
  constructor ({ saltRounds }) {
    this.saltRounds = saltRounds
  }

  async hash (plainPassword) {
    return await bcrypt.hash(plainPassword, this.saltRounds)
  }

  async compare (plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash)
  }
}
