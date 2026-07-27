const asyncHandler = require('../utils/asyncHandler')
const roomTypeService = require('../services/roomType.service')

// -- Public --

const listPublic = asyncHandler(async (req, res) => {
  const data = await roomTypeService.listPublicRoomTypes(req.property.id)
  res.status(200).json({ success: true, data })
})

const getPublicDetail = asyncHandler(async (req, res) => {
  const data = await roomTypeService.getPublicRoomTypeBySlug(req.property.id, req.params.roomTypeSlug)
  res.status(200).json({ success: true, data })
})

// -- Admin --

const listAdmin = asyncHandler(async (req, res) => {
  const { data, meta } = await roomTypeService.listAdminRoomTypes(req.property.id, req.query)
  res.status(200).json({ success: true, data, meta })
})

const createAdmin = asyncHandler(async (req, res) => {
  const data = await roomTypeService.createRoomType(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const getAdmin = asyncHandler(async (req, res) => {
  const data = await roomTypeService.getAdminRoomType(req.property.id, req.params.id)
  res.status(200).json({ success: true, data })
})

const updateAdmin = asyncHandler(async (req, res) => {
  const data = await roomTypeService.updateRoomType(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const deleteAdmin = asyncHandler(async (req, res) => {
  await roomTypeService.softDeleteRoomType(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Room type deactivated.' } })
})

const addImage = asyncHandler(async (req, res) => {
  const data = await roomTypeService.addImage(req.property.id, req.params.id, req.body)
  res.status(201).json({ success: true, data })
})

const updateImage = asyncHandler(async (req, res) => {
  const data = await roomTypeService.updateImage(req.property.id, req.params.id, req.params.imageId, req.body)
  res.status(200).json({ success: true, data })
})

const deleteImage = asyncHandler(async (req, res) => {
  await roomTypeService.deleteImage(req.property.id, req.params.id, req.params.imageId)
  res.status(200).json({ success: true, data: { message: 'Image removed.' } })
})

module.exports = {
  listPublic,
  getPublicDetail,
  listAdmin,
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  addImage,
  updateImage,
  deleteImage
}