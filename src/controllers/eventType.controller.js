const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/eventType.service')

const listPublic = asyncHandler(async (req, res) => {
  const data = await service.listPublic(req.property.id)
  res.status(200).json({ success: true, data })
})

const listAdmin = asyncHandler(async (req, res) => {
  const data = await service.listAdmin(req.property.id)
  res.status(200).json({ success: true, data })
})

const create = asyncHandler(async (req, res) => {
  const data = await service.create(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Event type deactivated.' } })
})

const reorder = asyncHandler(async (req, res) => {
  await service.reorder(req.property.id, req.body.items)
  res.status(200).json({ success: true, data: { message: 'Reordered.' } })
})

module.exports = { listPublic, listAdmin, create, update, remove, reorder }