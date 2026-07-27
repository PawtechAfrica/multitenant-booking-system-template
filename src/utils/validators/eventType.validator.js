const Joi = require('joi')

const createEventTypeSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  imageUrl: Joi.string().uri().allow(null, ''),
  icon: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0).default(0)
})

const updateEventTypeSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow(null, ''),
  imageUrl: Joi.string().uri().allow(null, ''),
  icon: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean()
}).min(1)

const reorderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      sortOrder: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
})

module.exports = { createEventTypeSchema, updateEventTypeSchema, reorderSchema }