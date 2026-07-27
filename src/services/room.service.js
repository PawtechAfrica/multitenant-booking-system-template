const { Room, RoomType } = require('../database/models')
const AppError = require('../utils/AppError')

const serializeRoom = (room) => ({
  id: room.id,
  propertyId: room.property_id,
  roomTypeId: room.room_type_id,
  roomNumber: room.room_number,
  floor: room.floor,
  status: room.status
})

const assertRoomTypeBelongs = async (propertyId, roomTypeId) => {
  const roomType = await RoomType.findOne({ where: { id: roomTypeId, property_id: propertyId } })
  if (!roomType) throw new AppError('Room type not found.', 404, 'ROOM_TYPE_NOT_FOUND')
}

const findOwnedRoom = async (propertyId, roomId) => {
  const room = await Room.findOne({ where: { id: roomId, property_id: propertyId } })
  if (!room) throw new AppError('Room not found.', 404, 'VALIDATION_ERROR')
  return room
}

const listRooms = async (propertyId, query) => {
  const where = { property_id: propertyId }
  if (query.roomTypeId) where.room_type_id = query.roomTypeId
  if (query.status) where.status = query.status

  const rooms = await Room.findAll({ where, order: [['room_number', 'ASC']] })
  return rooms.map(serializeRoom)
}

const createRoom = async (propertyId, payload) => {
  await assertRoomTypeBelongs(propertyId, payload.roomTypeId)

  const room = await Room.create({
    property_id: propertyId,
    room_type_id: payload.roomTypeId,
    room_number: payload.roomNumber,
    floor: payload.floor
  })

  return serializeRoom(room)
}

const updateRoom = async (propertyId, roomId, payload) => {
  const room = await findOwnedRoom(propertyId, roomId)

  if (payload.roomTypeId !== undefined) {
    await assertRoomTypeBelongs(propertyId, payload.roomTypeId)
    room.room_type_id = payload.roomTypeId
  }
  if (payload.roomNumber !== undefined) room.room_number = payload.roomNumber
  if (payload.floor !== undefined) room.floor = payload.floor

  await room.save()
  return serializeRoom(room)
}

const updateRoomStatus = async (propertyId, roomId, status) => {
  const room = await findOwnedRoom(propertyId, roomId)
  room.status = status
  await room.save()
  return serializeRoom(room)
}

const deleteRoom = async (propertyId, roomId) => {
  const room = await findOwnedRoom(propertyId, roomId)
  await room.destroy()
}

module.exports = { listRooms, createRoom, updateRoom, updateRoomStatus, deleteRoom }