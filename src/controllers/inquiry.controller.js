const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/inquiry.service')

const create = asyncHandler(async (req, res) => {
  const data = await service.createInquiry(req.body)
  res.status(201).json({ success: true, data })
})

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await service.listInquiries(req.property.id, req.query)
  res.status(200).json({ success: true, data, meta })
})

const getOne = asyncHandler(async (req, res) => {
  const data = await service.getInquiry(req.property.id, req.params.id)
  res.status(200).json({ success: true, data })
})

const updateStatus = asyncHandler(async (req, res) => {
  const data = await service.updateStatus(req.property.id, req.params.id, req.body.status)
  res.status(200).json({ success: true, data })
})

module.exports = { create, list, getOne, updateStatus }