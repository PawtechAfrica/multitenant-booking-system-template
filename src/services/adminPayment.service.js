const { Op } = require('sequelize')
const { Payment, Booking, Refund } = require('../database/models')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const serializePayment = (p) => ({
  id: p.id,
  bookingId: p.booking_id,
  provider: p.provider,
  type: p.type,
  amount: p.amount,
  currency: p.currency,
  status: p.status,
  providerReference: p.provider_reference,
  mpesaReceiptNumber: p.mpesa_receipt_number,
  phoneNumber: p.phone_number,
  initiatedAt: p.initiated_at,
  completedAt: p.completed_at
})

const serializeRefund = (r) => ({
  id: r.id,
  bookingId: r.booking_id,
  paymentId: r.payment_id,
  amount: r.amount,
  reason: r.reason,
  status: r.status,
  processedBy: r.processed_by
})

// Payments are scoped to a property indirectly, via their booking
const listPayments = async (propertyId, query) => {
  const { page, pageSize, offset, limit } = parsePagination(query)

  const bookingWhere = { property_id: propertyId }
  if (query.bookingId) bookingWhere.id = query.bookingId

  const paymentWhere = {}
  if (query.status) paymentWhere.status = query.status

  const { rows, count } = await Payment.findAndCountAll({
    where: paymentWhere,
    include: [{ model: Booking, as: 'booking', attributes: [], where: bookingWhere, required: true }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    subQuery: false
  })

  return { data: rows.map(serializePayment), meta: { total: count, page, pageSize } }
}

const findOwnedPayment = async (propertyId, paymentId) => {
  const payment = await Payment.findOne({
    where: { id: paymentId },
    include: [{ model: Booking, as: 'booking', where: { property_id: propertyId }, required: true }]
  })
  if (!payment) throw new AppError('Payment not found.', 404, 'VALIDATION_ERROR')
  return payment
}

const requestRefund = async (propertyId, paymentId, payload) => {
  const payment = await findOwnedPayment(propertyId, paymentId)

  if (payment.status !== 'completed') {
    throw new AppError('Only completed payments can be refunded.', 409, 'VALIDATION_ERROR')
  }

  const existingRefunds = await Refund.sum('amount', {
    where: { payment_id: payment.id, status: { [Op.ne]: 'rejected' } }
  })
  const alreadyRefunded = existingRefunds || 0

  if (payload.amount > Number(payment.amount) - alreadyRefunded) {
    throw new AppError('Refund amount exceeds what is left to refund on this payment.', 409, 'VALIDATION_ERROR')
  }

  const refund = await Refund.create({
    booking_id: payment.booking_id,
    payment_id: payment.id,
    amount: payload.amount,
    reason: payload.reason,
    status: 'requested'
  })

  return serializeRefund(refund)
}

const updateRefundStatus = async (propertyId, refundId, status, actingUserId) => {
  const refund = await Refund.findOne({
    where: { id: refundId },
    include: [{ model: Booking, as: 'booking', where: { property_id: propertyId }, required: true }]
  })
  if (!refund) throw new AppError('Refund not found.', 404, 'VALIDATION_ERROR')

  if (refund.status === 'completed' || refund.status === 'rejected') {
    throw new AppError(`This refund is already ${refund.status} and cannot be changed.`, 409, 'VALIDATION_ERROR')
  }

  refund.status = status
  refund.processed_by = actingUserId

  if (status === 'completed') {
    const booking = await Booking.findByPk(refund.booking_id)
    if (booking) {
      booking.amount_paid = Math.max(Number(booking.amount_paid) - Number(refund.amount), 0)
      booking.balance_due = Math.max(Number(booking.subtotal) - Number(booking.amount_paid), 0)
      await booking.save()
    }
  }

  await refund.save()
  return serializeRefund(refund)
}

module.exports = { listPayments, requestRefund, updateRefundStatus }