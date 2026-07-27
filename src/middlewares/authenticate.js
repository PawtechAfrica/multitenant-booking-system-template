const AppError = require('../utils/AppError')
const { verifyAccessToken } = require('../utils/jwt')

const authenticate = (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header.', 401, 'UNAUTHORIZED'))
  }

  const token = header.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.sub,
      role: payload.role,
      propertyId: payload.propertyId
    }
    next()
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401, 'UNAUTHORIZED'))
  }
}

module.exports = authenticate













