const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/adminPayment.service')

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await service.listPayments(req.property.id, req.query)
  res.status(200).json({ success: true, data, meta })
})

const refund = asyncHandler(async (req, res) => {
  const data = await service.requestRefund(req.property.id, req.params.id, req.body)
  res.status(201).json({ success: true, data })
})

const updateRefundStatus = asyncHandler(async (req, res) => {
  const data = await service.updateRefundStatus(req.property.id, req.params.id, req.body.status, req.user.id)
  res.status(200).json({ success: true, data })
})

module.exports = { list, refund, updateRefundStatus }