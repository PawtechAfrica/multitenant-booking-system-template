const Joi = require('joi')

const invitePendingUserSchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  role: Joi.string().valid('staff', 'admin').default('admin')
})

const acceptInviteSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'confirmPassword must match password.' })
})

module.exports = { invitePendingUserSchema, acceptInviteSchema }