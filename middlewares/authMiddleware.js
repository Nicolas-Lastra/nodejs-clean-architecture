export const createAuthMiddleware = ({ tokenService }) => {
  return async (req, res, next) => {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({ error: 'Access token is required' })

    try {
      const payload = await tokenService.verify(token)
      req.user = {
        id: payload.id,
        username: payload.username
      }
      next()
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
