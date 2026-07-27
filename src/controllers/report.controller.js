const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/report.service')

const occupancy = asyncHandler(async (req, res) => {
  const data = await service.getOccupancyReport(req.property.id, req.query)
  res.status(200).json({ success: true, data })
})

const revenue = asyncHandler(async (req, res) => {
  const data = await service.getRevenueReport(req.property.id, req.query)
  res.status(200).json({ success: true, data })
})

module.exports = { occupancy, revenue }