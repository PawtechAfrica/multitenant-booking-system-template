const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/offer.service')

const listPublic = asyncHandler(async (req, res) => {
  const data = await service.listPublicOffers(req.property.id)
  res.status(200).json({ success: true, data })
})

const listAdmin = asyncHandler(async (req, res) => {
  const { data, meta } = await service.listAdminOffers(req.property.id, req.query)
  res.status(200).json({ success: true, data, meta })
})

const create = asyncHandler(async (req, res) => {
  const data = await service.createOffer(req.property.id, req.body)
  res.status(201).json({ success: true, data })
})

const update = asyncHandler(async (req, res) => {
  const data = await service.updateOffer(req.property.id, req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const remove = asyncHandler(async (req, res) => {
  await service.deleteOffer(req.property.id, req.params.id)
  res.status(200).json({ success: true, data: { message: 'Offer deleted.' } })
})

module.exports = { listPublic, listAdmin, create, update, remove }