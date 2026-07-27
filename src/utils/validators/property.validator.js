const Joi = require('joi')

const updatePropertySchema = Joi.object({
  contactEmail: Joi.string().email(),
  contactPhone: Joi.string(),
  address: Joi.string(),
  checkInTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).message('checkInTime must be HH:mm'),
  checkOutTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).message('checkOutTime must be HH:mm')
}).min(1)

module.exports = { updatePropertySchema }