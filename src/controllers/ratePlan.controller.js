const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/ratePlan.service')

const list = asyncHandler(async (req, res) => {
  const data = await service.listRatePlans(req.property.id, req.query.roomTypeId)
  res.status(200).json({ success: true, data })
})

const create = asyncHandler(async (req, res) => {
  const data = await service.createRatePlan(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await service.updateRatePlan(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const remove = asyncHandler(async (req, res) => {
  await service.deleteRatePlan(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Rate plan deleted.' } })
})

module.exports = { list, create, update, remove }