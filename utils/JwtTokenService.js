import jwt from 'jsonwebtoken'

export class JwtTokenService {
  constructor ({ secret, expiresIn }) {
    this.secret = secret
    this.expiresIn = expiresIn
  }

  async verify (token) {
    return jwt.verify(token, this.secret)
  }

  async sign (payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    })
  }
}
