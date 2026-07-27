const { User, RefreshToken } = require('../database/models')
const { Op } = require('sequelize')
const AppError = require('../utils/AppError')
const { hashPassword, comparePassword } = require('../utils/password')
const {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken
} = require('../utils/jwt')

const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10)

const issueTokenPair = async (user) => {
  const accessToken = signAccessToken(user)
  const { raw, hash } = generateRefreshToken()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS)

  await RefreshToken.create({
    user_id: user.id,
    token_hash: hash,
    expires_at: expiresAt
  })

  return { accessToken, refreshToken: raw }
}

const registerGuest = async ({ email, password, firstName, lastName, phone }) => {
  const existing = await User.findOne({ where: { email } })
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'VALIDATION_ERROR')
  }

  const password_hash = await hashPassword(password)

  const user = await User.create({
    email,
    password_hash,
    first_name: firstName,
    last_name: lastName,
    phone,
    role: 'guest'
  })

  const tokens = await issueTokenPair(user)
  return { user, ...tokens }
}

// const login = async ({ email, password }) => {
//   const user = await User.findOne({ where: { email } })

//   if (!user || !user.password_hash) {
//     throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED')
//   }

//   const isMatch = await comparePassword(password, user.password_hash)
//   if (!isMatch) {
//     throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED')
//   }

//   const tokens = await issueTokenPair(user)
//   return { user, ...tokens }
// }


const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } })

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED')
  }

  if (!user.is_active) {
    throw new AppError('This account has been deactivated.', 403, 'FORBIDDEN_PROPERTY_SCOPE')
  }

  const isMatch = await comparePassword(password, user.password_hash)
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED')
  }

  const tokens = await issueTokenPair(user)
  return { user, ...tokens }
}

const refreshAccessToken = async ({ refreshToken }) => {
  const hash = hashRefreshToken(refreshToken)

  const stored = await RefreshToken.findOne({
    where: { token_hash: hash, revoked_at: null, expires_at: { [Op.gt]: new Date() } }
  })

  if (!stored) {
    throw new AppError('Invalid or expired refresh token.', 401, 'UNAUTHORIZED')
  }

  const user = await User.findByPk(stored.user_id)
  if (!user) {
    throw new AppError('Invalid or expired refresh token.', 401, 'UNAUTHORIZED')
  }

  // rotate: revoke the old one, issue a fresh pair
  stored.revoked_at = new Date()
  await stored.save()

  const tokens = await issueTokenPair(user)
  return { user, ...tokens }
}

const logout = async ({ refreshToken }) => {
  const hash = hashRefreshToken(refreshToken)
  await RefreshToken.update(
    { revoked_at: new Date() },
    { where: { token_hash: hash, revoked_at: null } }
  )
}

const getProfile = async (userId) => {
  const user = await User.findByPk(userId)
  if (!user) {
    throw new AppError('User not found.', 404, 'VALIDATION_ERROR')
  }
  return user
}

module.exports = {
  registerGuest,
  login,
  refreshAccessToken,
  logout,
  getProfile
}