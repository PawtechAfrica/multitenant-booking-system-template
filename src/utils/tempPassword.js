const crypto = require('crypto')

const generateTempPassword = () => {
  return crypto.randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) + '!1'
}

module.exports = { generateTempPassword }