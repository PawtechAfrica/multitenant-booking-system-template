const asyncHandler = require('../utils/asyncHandler')
const adminBookingService = require('../services/adminBooking.service')

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await adminBookingService.listBookings(req.property.id, req.query)
  res.status(200).json({ success: true, data, meta })
})

const getOne = asyncHandler(async (req, res) => {
  const data = await adminBookingService.getBooking(req.property.id, req.params.id)
  res.status(200).json({ success: true, data })
})

const updateStatus = asyncHandler(async (req, res) => {
  const data = await adminBookingService.updateBookingStatus(req.property.id, req.params.id, req.body.status)
  res.status(200).json({ success: true, data })
})

const assignRoom = asyncHandler(async (req, res) => {
  const data = await adminBookingService.assignRoom(req.property.id, req.params.id, req.body.roomId)
  res.status(200).json({ success: true, data })
})

const createManual = asyncHandler(async (req, res) => {
  const data = await adminBookingService.createManualBooking(req.property.slug, req.body)
  res.status(201).json({ success: true, data })
})

module.exports = { list, getOne, updateStatus, assignRoom, createManual }