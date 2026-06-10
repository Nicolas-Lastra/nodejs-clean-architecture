import { User } from '../../models/User.js'

export class RegisterUserUseCase {
  constructor ({ userRepository, idGenerator, passwordHasher }) {
    this.userRepository = userRepository
    this.idGenerator = idGenerator
    this.passwordHasher = passwordHasher
  }

  async execute ({ username, password, email }) {
    const existingUser = await this.userRepository.findByUsername(username)
    if (existingUser) throw new Error('Username already exists')

    const id = await this.idGenerator.generate()
    const passwordHash = await this.passwordHasher.hash(password)

    const newUser = new User({
      id,
      username,
      passwordHash,
      email
    })

    await this.userRepository.save(newUser)

    return newUser.toPublicData()
  }
}
