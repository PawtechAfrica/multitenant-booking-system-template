const { Booking, Payment } = require('../database/models')
const AppError = require('../utils/AppError')
const { normalizeKenyanPhone } = require('../utils/phone')
const mpesaService = require('./mpesa.service')

const NON_PAYABLE_STATUSES = ['cancelled', 'expired', 'no_show']

const getAmountForType = (booking, amountType) => {
  const amountPaid = Number(booking.amount_paid)
  const subtotal = Number(booking.subtotal)
  const balanceDue = Number(booking.balance_due)

  if (amountType === 'deposit') {
    if (amountPaid > 0) {
      throw new AppError('A payment has already been made on this booking.', 409, 'VALIDATION_ERROR')
    }
    return Number(booking.deposit_required) || subtotal
  }

  if (amountType === 'balance') {
    if (balanceDue <= 0) {
      throw new AppError('This booking is already fully paid.', 409, 'VALIDATION_ERROR')
    }
    return balanceDue
  }

  // full
  if (amountPaid > 0) {
    throw new AppError('Use amountType "balance" \u2014 a partial payment already exists.', 409, 'VALIDATION_ERROR')
  }
  return subtotal
}

const initiateStkPush = async ({ bookingCode, phoneNumber, amountType }) => {
  const booking = await Booking.findOne({ where: { booking_code: bookingCode } })

  if (!booking) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND')
  }

  if (NON_PAYABLE_STATUSES.includes(booking.status)) {
    throw new AppError('This booking can no longer accept payment.', 409, 'BOOKING_EXPIRED')
  }

  if (booking.status === 'pending_payment' && booking.expires_at && new Date() > new Date(booking.expires_at)) {
    booking.status = 'expired'
    await booking.save()
    throw new AppError('This booking hold has expired. Please make a new booking.', 409, 'BOOKING_EXPIRED')
  }

  const normalizedPhone = normalizeKenyanPhone(phoneNumber)
  const amount = getAmountForType(booking, amountType)

  const payment = await Payment.create({
    booking_id: booking.id,
    provider: 'mpesa',
    type: amountType,
    amount,
    currency: booking.currency || 'KES',
    status: 'initiated',
    phone_number: normalizedPhone,
    initiated_at: new Date()
  })

  try {
    const daraja = await mpesaService.stkPush({
      phoneNumber: normalizedPhone,
      amount,
      accountReference: booking.booking_code,
      transactionDesc: `${amountType} payment for ${booking.booking_code}`
    })

    payment.status = 'pending'
    payment.provider_reference = daraja.CheckoutRequestID
    await payment.save()
  } catch (err) {
    payment.status = 'failed'
    payment.raw_callback = err.response ? err.response.data : { message: err.message }
    await payment.save()
    throw new AppError('Could not initiate M-Pesa payment. Please try again.', 502, 'PAYMENT_FAILED')
  }

  return {
    status: payment.status,
    providerReference: payment.provider_reference
  }
}

const applyCompletedPaymentToBooking = async (booking, payment) => {
  booking.amount_paid = Number(booking.amount_paid) + Number(payment.amount)
  booking.balance_due = Math.max(Number(booking.subtotal) - Number(booking.amount_paid), 0)

  if (booking.status === 'pending_payment' && booking.amount_paid >= Number(booking.deposit_required)) {
    booking.status = 'confirmed'
  }

  await booking.save()
}

const handleCallback = async (body) => {
  const stkCallback = body?.Body?.stkCallback
  if (!stkCallback) return // malformed callback, nothing to do

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback

  const payment = await Payment.findOne({ where: { provider_reference: CheckoutRequestID } })
  if (!payment) return // unknown payment, ignore silently (Daraja doesn't need an error back)

  payment.raw_callback = body
  payment.completed_at = new Date()

  if (ResultCode === 0) {
    const items = CallbackMetadata?.Item || []
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')

    payment.status = 'completed'
    payment.mpesa_receipt_number = receipt ? receipt.Value : null
    await payment.save()

    const booking = await Booking.findByPk(payment.booking_id)
    if (booking) await applyCompletedPaymentToBooking(booking, payment)
  } else {
    payment.status = 'failed'
    await payment.save()
  }
}

const getPaymentStatus = async (bookingCode) => {
  const booking = await Booking.findOne({ where: { booking_code: bookingCode } })
  if (!booking) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND')
  }

  const payment = await Payment.findOne({
    where: { booking_id: booking.id },
    order: [['created_at', 'DESC']]
  })

  if (!payment) {
    throw new AppError('No payment found for this booking.', 404, 'BOOKING_NOT_FOUND')
  }

  return {
    status: payment.status,
    bookingStatus: booking.status,
    amount: payment.amount,
    mpesaReceiptNumber: payment.mpesa_receipt_number
  }
}

module.exports = { initiateStkPush, handleCallback, getPaymentStatus }