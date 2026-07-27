const crypto = require('crypto')

// "mums-garden-resort" -> "MGR" -> "MG" ; "centurion-hotel" -> "CH"
const prefixFromSlug = (slug) => {
  const initials = slug.split('-').map(word => word[0]).join('').toUpperCase()
  return initials.slice(0, 2)
}

const generateBookingCode = (propertySlug) => {
  const prefix = prefixFromSlug(propertySlug)
  const random = crypto.randomBytes(3).toString('hex').toUpperCase() // 6 hex chars
  return `${prefix}-${random}`
}

module.exports = { generateBookingCode }