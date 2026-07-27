const { Property } = require('../database/models')
const AppError = require('../utils/AppError')

const resolveProperty = async (req, res, next) => {
  const { propertySlug } = req.params

  try {
    const property = await Property.findOne({
      where: { slug: propertySlug, is_active: true }
    })

    if (!property) {
      return next(new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND'))
    }

    req.property = property
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = resolveProperty