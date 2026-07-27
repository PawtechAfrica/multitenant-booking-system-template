const AppError = require('../utils/AppError')

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do this.', 403, 'FORBIDDEN_PROPERTY_SCOPE'))
  }
  next()
}

module.exports = requireRole