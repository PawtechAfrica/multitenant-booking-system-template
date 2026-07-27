const Joi = require('joi')

const CATEGORIES = ['rooms', 'dining', 'events', 'exterior']

const createGalleryItemSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES).required(),
  imageUrl: Joi.string().uri().required(),
  caption: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0).default(0)
})

const updateGalleryItemSchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES),
  caption: Joi.string().allow(null, ''),
  sortOrder: Joi.number().integer().min(0)
}).min(1)

const reorderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      sortOrder: Joi.number().integer().min(0).required()
    })
  ).min(1).required()
})

const listGalleryQuerySchema = Joi.object({
  category: Joi.string().valid(...CATEGORIES)
})

module.exports = {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  reorderSchema,
  listGalleryQuerySchema
}