import { validatePartialUser, validateUser } from '../schemas/User.js'

export class AuthController {
  constructor ({ registerUserUseCase, loginUserUseCase }) {
    this.registerUserUseCase = registerUserUseCase
    this.loginUserUseCase = loginUserUseCase
  }

  register = async (req, res, next) => {
    const validatedUser = validateUser(req.body)
    if (validatedUser.error) {
      return res.status(422).json({ error: "User couldn't be validated" })
    }
    try {
      const user = await this.registerUserUseCase.execute(validatedUser.data)
      res.status(201).json({ user })
    } catch (error) {
      next(error)
    }
  }

  login = async (req, res, next) => {
    const validatedPartialUser = validatePartialUser(req.body)
    if (validatePartialUser.error) {
      return res.status(422).json({ error: "User couldn't be validated" })
    }

    try {
      const { user, accessToken } = await this.loginUserUseCase.execute(validatedPartialUser.data)
      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        })
        .json({ user })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req, res, next) => {
    try {
      res
        .clearCookie('access_token')
        .json({ message: 'Logout successful' })
    } catch (error) {
      next(error)
    }
  }
}
