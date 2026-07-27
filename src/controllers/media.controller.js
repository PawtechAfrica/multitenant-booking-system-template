const asyncHandler = require('../utils/asyncHandler')
const service = require('../services/media.service')

const upload = asyncHandler(async (req, res) => {
  const data = await service.uploadMedia(req.property.id, req.file, req.user.id)
  res.status(201).json({ success: true, data })
})

module.exports = { upload }