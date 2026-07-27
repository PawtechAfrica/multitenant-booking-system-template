const Joi = require('joi')

const BED_TYPES = ['single', 'twin', 'double', 'queen', 'king', 'bunk']

const createRoomTypeSchema = Joi.object({
  slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/).required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  sizeSqm: Joi.number().positive().allow(null),
  bedType: Joi.string().valid(...BED_TYPES).allow(null),
  maxAdults: Joi.number().integer().min(1).required(),
  maxChildren: Joi.number().integer().min(0).default(0),
  totalUnits: Joi.number().integer().min(1).required(),
  basePrice: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('KES'),
  attributes: Joi.object().unknown(true).default({})
})

const updateRoomTypeSchema = Joi.object({
  slug: Joi.string().lowercase().pattern(/^[a-z0-9-]+$/),
  name: Joi.string(),
  description: Joi.string().allow(null, ''),
  sizeSqm: Joi.number().positive().allow(null),
  bedType: Joi.string().valid(...BED_TYPES).allow(null),
  maxAdults: Joi.number().integer().min(1),
  maxChildren: Joi.number().integer().min(0),
  totalUnits: Joi.number().integer().min(1),
  basePrice: Joi.number().positive(),
  currency: Joi.string().length(3),
  attributes: Joi.object().unknown(true),
  isActive: Joi.boolean()
}).min(1)

const createImageSchema = Joi.object({
  url: Joi.string().uri().required(),
  altText: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0).default(0),
  isCover: Joi.boolean().default(false)
})

const updateImageSchema = Joi.object({
  altText: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0),
  isCover: Joi.boolean()
}).min(1)

module.exports = {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  createImageSchema,
  updateImageSchema
}