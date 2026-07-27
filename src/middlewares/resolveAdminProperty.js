const { Property } = require('../database/models')
const AppError = require('../utils/AppError')

const resolveAdminProperty = async (req, res, next) => {
  try {
    const { role, propertyId } = req.user

    if (role === 'superadmin') {
      const targetId = req.query.propertyId

      if (!targetId) {
        return next(new AppError('superadmin must specify ?propertyId= for this request.', 400, 'VALIDATION_ERROR'))
      }

      const property = await Property.findByPk(targetId)
      if (!property) {
        return next(new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND'))
      }

      req.property = property
      return next()
    }

    // staff / admin -- always their own property, query params are ignored on purpose
    if (!propertyId) {
      return next(new AppError('This account is not assigned to a property.', 403, 'FORBIDDEN_PROPERTY_SCOPE'))
    }

    const property = await Property.findByPk(propertyId)
    if (!property) {
      return next(new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND'))
    }

    req.property = property
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = resolveAdminProperty