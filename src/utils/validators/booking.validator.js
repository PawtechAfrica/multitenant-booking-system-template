const Joi = require('joi')

const createBookingSchema = Joi.object({
  propertySlug: Joi.string().required(),
  roomTypeId: Joi.string().uuid().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
  numAdults: Joi.number().integer().min(1).default(1),
  numChildren: Joi.number().integer().min(0).default(0),
  numRooms: Joi.number().integer().min(1).default(1),
  guestFirstName: Joi.string().required(),
  guestLastName: Joi.string().required(),
  guestEmail: Joi.string().email().required(),
  guestPhone: Joi.string().allow(null, ''),
  specialRequests: Joi.string().allow(null, '')
})

const lookupBookingQuerySchema = Joi.object({
  email: Joi.string().email().required()
})

const cancelBookingSchema = Joi.object({
  email: Joi.string().email().required()
})

module.exports = { createBookingSchema, lookupBookingQuerySchema, cancelBookingSchema }