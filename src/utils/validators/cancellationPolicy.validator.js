const Joi = require('joi')

const tierSchema = Joi.object({
  days_before: Joi.number().integer().min(0),
  hours_before: Joi.number().integer().min(0),
  refund_pct: Joi.number().min(0).max(100).required()
}).xor('days_before', 'hours_before') // exactly one of the two must be present

const createPolicySchema = Joi.object({
  name: Joi.string().required(),
  tiers: Joi.array().items(tierSchema).min(1).required(),
  depositPct: Joi.number().min(0).max(100).required(),
  isDefault: Joi.boolean().default(false)
})

const updatePolicySchema = Joi.object({
  name: Joi.string(),
  tiers: Joi.array().items(tierSchema).min(1),
  depositPct: Joi.number().min(0).max(100),
  isDefault: Joi.boolean()
}).min(1)

module.exports = { createPolicySchema, updatePolicySchema }