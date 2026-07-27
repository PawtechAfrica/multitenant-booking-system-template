const { User, Property } = require('../database/models')
const AppError = require('../utils/AppError')
const { hashPassword } = require('../utils/password')
const { generateTempPassword } = require('../utils/tempPassword')

const serializeStaff = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  role: user.role,
  propertyId: user.property_id,
  isActive: user.is_active
})

const createStaff = async ({ email, firstName, lastName, role, propertyId }) => {
  const existing = await User.findOne({ where: { email } })
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'VALIDATION_ERROR')
  }

  const property = await Property.findByPk(propertyId)
  if (!property) {
    throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')
  }

  const tempPassword = generateTempPassword()
  const password_hash = await hashPassword(tempPassword)

  const user = await User.create({
    email,
    first_name: firstName,
    last_name: lastName,
    role,
    property_id: propertyId,
    password_hash,
    is_active: true
  })

  return {
    ...serializeStaff(user),
    tempPassword // TODO: remove once email invites are wired up -- for now the superadmin must relay this manually
  }
}

const listStaff = async (propertyId) => {
  const where = {
    role: ['staff', 'admin']
  }
  if (propertyId) where.property_id = propertyId

  const users = await User.findAll({ where, order: [['created_at', 'DESC']] })
  return users.map(serializeStaff)
}

const updateStaff = async (id, payload) => {
  const user = await User.findOne({ where: { id, role: ['staff', 'admin'] } })
  if (!user) {
    throw new AppError('Staff account not found.', 404, 'VALIDATION_ERROR')
  }

  if (payload.propertyId) {
    const property = await Property.findByPk(payload.propertyId)
    if (!property) {
      throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')
    }
    user.property_id = payload.propertyId
  }

  if (payload.role) user.role = payload.role
  if (payload.isActive !== undefined) user.is_active = payload.isActive

  await user.save()
  return serializeStaff(user)
}

const deactivateStaff = async (id) => {
  const user = await User.findOne({ where: { id, role: ['staff', 'admin'] } })
  if (!user) {
    throw new AppError('Staff account not found.', 404, 'VALIDATION_ERROR')
  }

  user.is_active = false
  await user.save()
}

module.exports = { createStaff, listStaff, updateStaff, deactivateStaff }