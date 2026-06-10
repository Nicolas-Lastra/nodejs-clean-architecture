export class User {
  // Propiedades privadas #
  #id
  #username
  #passwordHash
  #email

  constructor ({ id, username, passwordHash, email }) {
    if (!id) throw new Error('User id is required')
    if (!username) throw new Error('Username is required')
    if (!passwordHash) throw new Error('Password hash is required')
    if (!email) throw new Error('Email es required')

    this.#id = id
    this.#username = username
    this.#passwordHash = passwordHash
    this.#email = email
  }

  // getters
  get id () {
    return this.#id
  }

  get username () {
    return this.#username
  }

  get passwordHash () {
    return this.#passwordHash
  }

  get email () {
    return this.#email
  }

  // Métodos
  toPrimitives () {
    return {
      id: this.#id,
      username: this.#username,
      passwordHash: this.#passwordHash,
      email: this.#email
    }
  }

  toPublicData () {
    return {
      id: this.#id,
      username: this.#username,
      email: this.#email
    }
  }
}
