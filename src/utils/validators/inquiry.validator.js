const Joi = require('joi')

const createInquirySchema = Joi.object({
  propertySlug: Joi.string().required(),
  type: Joi.string().valid('general', 'group_bookings', 'events', 'meetings').required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ''),
  message: Joi.string().required(),
  partySize: Joi.number().integer().min(1).allow(null),
  preferredDate: Joi.date().iso().allow(null)
})

const updateInquiryStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'closed').required()
})

const listInquiriesQuerySchema = Joi.object({
  type: Joi.string().valid('general', 'group_bookings', 'events', 'meetings'),
  status: Joi.string().valid('new', 'contacted', 'closed'),
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100)
})

module.exports = { createInquirySchema, updateInquiryStatusSchema, listInquiriesQuerySchema }