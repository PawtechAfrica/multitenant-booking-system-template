const Joi = require('joi')

const createOfferSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  discountType: Joi.string().valid('percentage', 'fixed_amount').required(),
  discountValue: Joi.number().positive().required(),
  validFrom: Joi.date().iso().allow(null),
  validTo: Joi.date().iso().allow(null),
  imageUrl: Joi.string().uri().allow(null, ''),
  terms: Joi.string().allow(null, '')
})

const updateOfferSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
  discountType: Joi.string().valid('percentage', 'fixed_amount'),
  discountValue: Joi.number().positive(),
  validFrom: Joi.date().iso().allow(null),
  validTo: Joi.date().iso().allow(null),
  imageUrl: Joi.string().uri().allow(null, ''),
  terms: Joi.string().allow(null, ''),
  isActive: Joi.boolean()
}).min(1)

module.exports = { createOfferSchema, updateOfferSchema }