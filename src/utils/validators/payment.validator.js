const Joi = require('joi')

const stkPushSchema = Joi.object({
  bookingCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  amountType: Joi.string().valid('deposit', 'balance', 'full').required()
})

const listPaymentsQuerySchema = Joi.object({
  bookingId: Joi.string().uuid(),
  status: Joi.string().valid('initiated', 'pending', 'completed', 'failed', 'reversed'),
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100)
})

const createRefundSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().required()
})

const updateRefundStatusSchema = Joi.object({
  status: Joi.string().valid('processing', 'completed', 'rejected').required()
})

module.exports = {
  stkPushSchema,
  listPaymentsQuerySchema,
  createRefundSchema,
  updateRefundStatusSchema
}