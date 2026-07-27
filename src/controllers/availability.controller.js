const asyncHandler = require('../utils/asyncHandler')
const availabilityService = require('../services/availability.service')

const getAvailability = asyncHandler(async (req, res) => {
  const data = await availabilityService.getAvailability(req.property.id, req.query)
  res.status(200).json({ success: true, data })
})

module.exports = { getAvailability }