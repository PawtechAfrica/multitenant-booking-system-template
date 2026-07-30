const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/staffInvite.service')

const listPending = asyncHandler(async (req, res) => {
  const data = await service.listPendingStaff()
  res.status(200).json({ success: true, data })
})

const invite = asyncHandler(async (req, res) => {
  const data = await service.invitePendingUser(req.params.id, req.body)
  res.status(200).json({ success: true, data })
})

const reject = asyncHandler(async (req, res) => {
  await service.rejectPendingUser(req.params.id)
  res.status(200).json({ success: true, data: { message: 'Application discarded.' } })
})

const getInvite = asyncHandler(async (req, res) => {
  const data = await service.getInviteDetails(req.params.token)
  res.status(200).json({ success: true, data })
})

const accept = asyncHandler(async (req, res) => {
  const data = await service.acceptInvite(req.body)
  res.status(200).json({ success: true, data })
})

module.exports = { listPending, invite, reject, getInvite, accept }