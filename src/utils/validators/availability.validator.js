const Joi = require('joi')

const availabilityQuerySchema = Joi.object({
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required()
    .messages({ 'date.greater': 'checkOut must be after checkIn.' }),
  adults: Joi.number().integer().min(1).default(1),
  children: Joi.number().integer().min(0).default(0)
})

module.exports = { availabilityQuerySchema }