const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const signAccessToken = user => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      propertyId: user.property_id
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  )
}

const verifyAccessToken = token => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

const generateRefreshToken = () => {
  const raw = crypto.randomBytes(64).toString('hex')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

const hashRefreshToken = raw => {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken
}