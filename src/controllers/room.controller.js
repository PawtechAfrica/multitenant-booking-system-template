const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/room.service')

const list = asyncHandler(async (req, res) => {
  const data = await service.listRooms(req.property.id, req.query)
  res.status(200).json({ success: true, data })
})

const create = asyncHandler(async (req, res) => {
  const data = await service.createRoom(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await service.updateRoom(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const updateStatus = asyncHandler(async (req, res) => {
  const data = await service.updateRoomStatus(req.property.id, req.params.id, req.body.status)
  res.status(200).json({ success: true, data })
})

const remove = asyncHandler(async (req, res) => {
  await service.deleteRoom(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Room deleted.' } })
})

module.exports = { list, create, update, updateStatus, remove }