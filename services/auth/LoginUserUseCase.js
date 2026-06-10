export class LoginUserUseCase {
  constructor ({ userRepository, passwordHasher, tokenService }) {
    this.userRepository = userRepository
    this.passwordHasher = passwordHasher
    this.tokenService = tokenService
  }

  async execute ({ username, password }) {
    const user = await this.userRepository.findByUsername(username)
    if (!user) throw new Error('Invalid credentials')

    const isValidPassword = await this.passwordHasher.compare(password, user.passwordHash)
    if (!isValidPassword) throw new Error('Invalid credentials')

    const accessToken = await this.tokenService.sign({ id: user.id, username: user.username })

    return {
      user: user.toPublicData(),
      accessToken
    }
  }
}
