const asyncHandler = require('../utils/asyncHandler')
const paymentService = require('../services/payment.service')

const stkPush = asyncHandler(async (req, res) => {
  const data = await paymentService.initiateStkPush(req.body)
  res.status(200).json({ success: true, data })
})

const callback = asyncHandler(async (req, res) => {
  await paymentService.handleCallback(req.body)
  // Daraja just needs a 200 acknowledging receipt -- it retries otherwise
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' })
})

const status = asyncHandler(async (req, res) => {
  const data = await paymentService.getPaymentStatus(req.params.bookingCode)
  res.status(200).json({ success: true, data })
})

module.exports = { stkPush, callback, status }