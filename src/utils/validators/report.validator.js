const Joi = require('joi')

const dateRangeSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().greater(Joi.ref('from')).required()
})

module.exports = { dateRangeSchema }