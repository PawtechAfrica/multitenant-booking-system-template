const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/auth.service')

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  phone: user.phone,
  role: user.role,
  propertyId: user.property_id
})

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerGuest(req.body)
  res.status(201).json({
    success: true,
    data: { user: serializeUser(user), accessToken, refreshToken }
  })
})

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body)
  res.status(200).json({
    success: true,
    data: { user: serializeUser(user), accessToken, refreshToken }
  })
})

const refresh = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(req.body)
  res.status(200).json({
    success: true,
    data: { user: serializeUser(user), accessToken, refreshToken }
  })
})

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body)
  res.status(200).json({ success: true, data: { message: 'Logged out.' } })
})

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id)
  res.status(200).json({ success: true, data: serializeUser(user) })
})

module.exports = { register, login, refresh, logout, me }