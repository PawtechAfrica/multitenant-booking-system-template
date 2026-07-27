const AppError = require('../utils/AppError')

const validateQuery = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true })

  if (error) {
    const message = error.details.map(d => d.message).join('; ')
    return next(new AppError(message, 400, 'VALIDATION_ERROR'))
  }

  req.query = value
  next()
}

module.exports = validateQuery