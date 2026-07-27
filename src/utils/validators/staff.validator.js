const Joi = require('joi')

const createStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('staff', 'admin').required(),
  propertyId: Joi.string().uuid().required()
})

const updateStaffSchema = Joi.object({
  role: Joi.string().valid('staff', 'admin'),
  propertyId: Joi.string().uuid(),
  isActive: Joi.boolean()
}).min(1)

const listStaffQuerySchema = Joi.object({
  propertyId: Joi.string().uuid()
})

module.exports = { createStaffSchema, updateStaffSchema, listStaffQuerySchema }


//b18kjTnqEogC!1