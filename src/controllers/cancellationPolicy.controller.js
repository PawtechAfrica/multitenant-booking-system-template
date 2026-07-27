const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/cancellationPolicy.service')

const list = asyncHandler(async (req, res) => {
  const data = await service.listPolicies(req.property.id)
  res.status(200).json({ success: true, data })
})

const create = asyncHandler(async (req, res) => {
  const data = await service.createPolicy(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await service.updatePolicy(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const remove = asyncHandler(async (req, res) => {
  await service.deletePolicy(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Cancellation policy deleted.' } })
})

const makeDefault = asyncHandler(async (req, res) => {
  const data = await service.setDefault(req.property.id, req.params.id)
  res.status(200).json({ success: true, data })
})

module.exports = { list, create, update, remove, makeDefault }