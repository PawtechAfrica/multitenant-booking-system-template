const Joi = require('joi')

const listBookingsQuerySchema = Joi.object({
  status: Joi.string().valid(
    'pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'expired'
  ),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  search: Joi.string(),
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100)
})

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show').required()
})

const assignRoomSchema = Joi.object({
  roomId: Joi.string().uuid().required()
})

const manualBookingSchema = Joi.object({
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
  specialRequests: Joi.string().allow(null, ''),
  paymentCollected: Joi.string().valid('cash', 'mpesa', 'none').default('none')
})

module.exports = {
  listBookingsQuerySchema,
  updateStatusSchema,
  assignRoomSchema,
  manualBookingSchema
}