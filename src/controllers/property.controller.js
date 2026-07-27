const { serializeProperty } = require('../services/property.service')
const asyncHandler = require('../utils/asyncHandler')

const getPublicProperty = (req, res) => {
  res.status(200).json({ success: true, data: serializeProperty(req.property) })
}

const getAdminProperty = (req, res) => {
  res.status(200).json({ success: true, data: serializeProperty(req.property) })
}



const updateAdminProperty = asyncHandler(async (req, res) => {
  const property = req.property
  const fieldMap = {
    contactEmail: 'contact_email',
    contactPhone: 'contact_phone',
    address: 'address',
    checkInTime: 'check_in_time',
    checkOutTime: 'check_out_time'
  }
  for (const [key, column] of Object.entries(fieldMap)) {
    if (req.body[key] !== undefined) property[column] = req.body[key]
  }
  await property.save()
  res.status(200).json({ success: true, data: serializeProperty(property) })
})

module.exports = { getPublicProperty, getAdminProperty, updateAdminProperty }


