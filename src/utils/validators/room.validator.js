const Joi = require('joi')

const createRoomSchema = Joi.object({
  roomTypeId: Joi.string().uuid().required(),
  roomNumber: Joi.string().required(),
  floor: Joi.string().allow(null, '')
})

const updateRoomSchema = Joi.object({
  roomTypeId: Joi.string().uuid(),
  roomNumber: Joi.string(),
  floor: Joi.string().allow(null, '')
}).min(1)

const updateRoomStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'maintenance', 'out_of_service').required()
})

const listRoomsQuerySchema = Joi.object({
  roomTypeId: Joi.string().uuid(),
  status: Joi.string().valid('active', 'maintenance', 'out_of_service')
})

module.exports = { createRoomSchema, updateRoomSchema, updateRoomStatusSchema, listRoomsQuerySchema }