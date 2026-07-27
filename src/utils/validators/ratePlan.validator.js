const Joi = require('joi')

const createRatePlanSchema = Joi.object({
  roomTypeId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  priceOverride: Joi.number().positive().required(),
  cancellationPolicyId: Joi.string().uuid().allow(null),
  validFrom: Joi.date().iso().required(),
  validTo: Joi.date().iso().greater(Joi.ref('validFrom')).required()
})

const updateRatePlanSchema = Joi.object({
  name: Joi.string(),
  priceOverride: Joi.number().positive(),
  cancellationPolicyId: Joi.string().uuid().allow(null),
  validFrom: Joi.date().iso(),
  validTo: Joi.date().iso(),
  isActive: Joi.boolean()
}).min(1)

module.exports = { createRatePlanSchema, updateRatePlanSchema }