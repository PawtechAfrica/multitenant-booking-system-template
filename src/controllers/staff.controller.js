const asyncHandler = require('../utils/asyncHandler')
const staffService = require('../services/staff.service')

const create = asyncHandler(async (req, res) => {
  const data = await staffService.createStaff(req.body)
  res.status(201).json({ success: true, data })
})

const list = asyncHandler(async (req, res) => {
  const data = await staffService.listStaff(req.query.propertyId)
  res.status(200).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await staffService.updateStaff(req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const deactivate = asyncHandler(async (req, res) => {
  await staffService.deactivateStaff(req.params.id)
  res.status(200).json({ success: true, data: { message: 'Staff account deactivated.' } })
})

module.exports = { create, list, update, deactivate }