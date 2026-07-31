const { Op } = require('sequelize')
const { User, Property, InviteToken } = require('../database/models')
const AppError = require('../utils/AppError')
const { hashPassword } = require('../utils/password')
const { generateRefreshToken, hashRefreshToken, signAccessToken } = require('../utils/jwt')
const { generateRefreshToken: genInviteRaw, hashRefreshToken: hashInvite } = require('../utils/jwt')
const resend = require('../config/resend')
const { getSender } = require('../config/emailSenders')
const templates = require('../utils/emailTemplates')

const INVITE_HOURS = parseInt(process.env.INVITE_TOKEN_EXPIRES_HOURS || '48', 10)
const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10)

const serializePendingUser = (u) => ({
  id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, phone: u.phone, role: u.role
})

const listPendingStaff = async () => {
  const users = await User.findAll({
    where: { password_hash: null, role: ['staff', 'admin'] },
    order: [['created_at', 'DESC']]
  })
  return users.map(serializePendingUser)
}

const sendInviteEmail = async (user, property) => {
  const { raw, hash } = genInviteRaw()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + INVITE_HOURS)

  await InviteToken.create({ user_id: user.id, token_hash: hash, expires_at: expiresAt })

  const link = `${process.env.ADMIN_APP_URL}/set-password?token=${raw}`
  const sender = getSender(property.slug)
  const { subject, html } = templates.staffInvite(user, property, link)

  try {
    await resend.emails.send({ from: `${sender.name} <${sender.from}>`, to: user.email, subject, html })
  } catch (err) {
    console.log('[staffInvite] failed to send invite email:', err.message)
    throw new AppError('Account was created but the invite email failed to send. Check email config and retry.', 502, 'VALIDATION_ERROR')
  }
}

const invitePendingUser = async (userId, { propertyId, role }) => {
  const user = await User.findOne({ where: { id: userId, password_hash: null } })
  if (!user) throw new AppError('Pending applicant not found.', 404, 'VALIDATION_ERROR')

  const property = await Property.findByPk(propertyId)
  if (!property) throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')

  user.property_id = propertyId
  user.role = role
  await user.save()

  await sendInviteEmail(user, property)

  return serializePendingUser(user)
}


// const invitePendingUser = async (userId, { propertyId, role }) => {
//   const user = await User.findOne({ where: { id: userId, password_hash: null } })
//   if (!user) throw new AppError('Pending applicant not found.', 404, 'VALIDATION_ERROR')

//   const property = await Property.findByPk(propertyId)
//   if (!property) throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')

//   user.property_id = propertyId
//   user.role = role
//   await user.save()

//   const { raw, hash } = genInviteRaw()
//   const expiresAt = new Date()
//   expiresAt.setHours(expiresAt.getHours() + INVITE_HOURS)

//   await InviteToken.create({ user_id: user.id, token_hash: hash, expires_at: expiresAt })

//   const link = `${process.env.ADMIN_APP_URL}/set-password?token=${raw}`
//   const sender = getSender(property.slug)
//   const { subject, html } = templates.staffInvite(user, property, link)

//   try {
//     await resend.emails.send({ from: `${sender.name} <${sender.from}>`, to: user.email, subject, html })
//   } catch (err) {
//     console.error('[staffInvite] failed to send invite email:', err.message)
//     throw new AppError('User was assigned but the invite email failed to send. Check email config and retry.', 502, 'VALIDATION_ERROR')
//   }

//   return serializePendingUser(user)
// }

const rejectPendingUser = async (userId) => {
  const user = await User.findOne({ where: { id: userId, password_hash: null } })
  if (!user) throw new AppError('Pending applicant not found.', 404, 'VALIDATION_ERROR')
  await user.destroy()
}

const getInviteDetails = async (rawToken) => {
  const hash = hashInvite(rawToken)
  const invite = await InviteToken.findOne({
    where: { token_hash: hash, used_at: null, expires_at: { [Op.gt]: new Date() } }
  })
  if (!invite) throw new AppError('This invite link is invalid or has expired.', 404, 'VALIDATION_ERROR')

  const user = await User.findByPk(invite.user_id)
  if (!user) throw new AppError('This invite link is invalid or has expired.', 404, 'VALIDATION_ERROR')

  const property = user.property_id ? await Property.findByPk(user.property_id) : null

  return {
    firstName: user.first_name,
    email: user.email,
    role: user.role,
    propertyName: property ? property.name : null
  }
}

const acceptInvite = async ({ token, password }) => {
  const hash = hashInvite(token)
  const invite = await InviteToken.findOne({
    where: { token_hash: hash, used_at: null, expires_at: { [Op.gt]: new Date() } }
  })
  if (!invite) throw new AppError('This invite link is invalid or has expired.', 404, 'VALIDATION_ERROR')

  const user = await User.findByPk(invite.user_id)
  if (!user) throw new AppError('This invite link is invalid or has expired.', 404, 'VALIDATION_ERROR')

  user.password_hash = await hashPassword(password)
  user.is_active = true
  await user.save()

  invite.used_at = new Date()
  await invite.save()

  const accessToken = signAccessToken(user)
  const { raw, hash: refreshHash } = generateRefreshToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS)
  await require('../database/models').RefreshToken.create({ user_id: user.id, token_hash: refreshHash, expires_at: expiresAt })

  return {
    accessToken,
    refreshToken: raw,
    user: { id: user.id, email: user.email, role: user.role, propertyId: user.property_id }
  }
}

// module.exports = { listPendingStaff, invitePendingUser, rejectPendingUser, getInviteDetails, acceptInvite }

module.exports = { listPendingStaff, invitePendingUser, rejectPendingUser, getInviteDetails, acceptInvite, sendInviteEmail }