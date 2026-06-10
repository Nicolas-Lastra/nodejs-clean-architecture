import jwt from 'jsonwebtoken'

export class TokenService {
  constructor ({ secret, expiresIn }) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  async sign (payload) {
    const token = jwt.sign(
      payload,
      this.secret,
      { expiresIn: this.expiresIn }
    )

    return token
  }

  async verify (token) {
    const data = jwt.verify(token, this.secret)
    return data
  }
}
