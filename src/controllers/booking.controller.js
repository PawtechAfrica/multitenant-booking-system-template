const asyncHandler = require('../utils/asyncHandler')
const bookingService = require('../services/booking.service')

const create = asyncHandler(async (req, res) => {
  const data = await bookingService.createBooking(req.body)
  res.status(201).json({ success: true, data })
})

const getByCode = asyncHandler(async (req, res) => {
  const data = await bookingService.getBookingForGuest(req.params.bookingCode, req.query.email)
  res.status(200).json({ success: true, data })
})

const cancel = asyncHandler(async (req, res) => {
  const data = await bookingService.cancelBookingForGuest(req.params.bookingCode, req.body.email)
  res.status(200).json({ success: true, data })
})

module.exports = { create, getByCode, cancel }