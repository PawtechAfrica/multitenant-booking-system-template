const Joi = require('joi')

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().allow(null, '')
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
})

module.exports = { registerSchema, loginSchema, refreshSchema }