const { Op } = require('sequelize')
const { Booking, BookingRoom, Room, RoomType, Payment } = require('../database/models')
const AppError = require('../utils/AppError')
const { canTransition } = require('../utils/bookingStatus')
const { parsePagination } = require('../utils/pagination')
const { serializeBooking, createBooking: createGuestBooking } = require('./booking.service')

const listBookings = async (propertyId, query) => {
  const { page, pageSize, offset, limit } = parsePagination(query)

  const where = { property_id: propertyId }
  if (query.status) where.status = query.status

  if (query.from || query.to) {
    where.check_in_date = {}
    if (query.from) where.check_in_date[Op.gte] = query.from
    if (query.to) where.check_in_date[Op.lte] = query.to
  }

  if (query.search) {
    where[Op.or] = [
      { guest_first_name: { [Op.iLike]: `%${query.search}%` } },
      { guest_last_name: { [Op.iLike]: `%${query.search}%` } },
      { guest_email: { [Op.iLike]: `%${query.search}%` } },
      { guest_phone: { [Op.iLike]: `%${query.search}%` } },
      { booking_code: { [Op.iLike]: `%${query.search}%` } }
    ]
  }

  const { rows, count } = await Booking.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset
  })

  return {
    data: rows.map(serializeBooking),
    meta: { total: count, page, pageSize }
  }
}

const findOwnedBooking = async (propertyId, bookingId) => {
  const booking = await Booking.findOne({ where: { id: bookingId, property_id: propertyId } })
  if (!booking) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND')
  }
  return booking
}

const getBooking = async (propertyId, bookingId) => {
  return serializeBooking(await findOwnedBooking(propertyId, bookingId))
}

const updateBookingStatus = async (propertyId, bookingId, newStatus) => {
  const booking = await findOwnedBooking(propertyId, bookingId)

  if (!canTransition(booking.status, newStatus)) {
    throw new AppError(
      `Cannot move a booking from "${booking.status}" to "${newStatus}".`,
      409,
      'VALIDATION_ERROR'
    )
  }

  booking.status = newStatus
  await booking.save()
  return serializeBooking(booking)
}

const assignRoom = async (propertyId, bookingId, roomId) => {
  const booking = await findOwnedBooking(propertyId, bookingId)

  const room = await Room.findOne({ where: { id: roomId, property_id: propertyId } })
  if (!room) {
    throw new AppError('Room not found.', 404, 'VALIDATION_ERROR')
  }
  if (room.room_type_id !== booking.room_type_id) {
    throw new AppError('This room does not match the booking\'s room type.', 409, 'VALIDATION_ERROR')
  }
  if (room.status !== 'active') {
    throw new AppError('This room is not available for assignment right now.', 409, 'VALIDATION_ERROR')
  }

  const unassignedSlot = await BookingRoom.findOne({
    where: { booking_id: booking.id, room_id: null },
    order: [['sequence', 'ASC']]
  })
  if (!unassignedSlot) {
    throw new AppError('All rooms on this booking are already assigned.', 409, 'VALIDATION_ERROR')
  }

  unassignedSlot.room_id = room.id
  await unassignedSlot.save()

  return { bookingId: booking.id, roomId: room.id, roomNumber: room.room_number, sequence: unassignedSlot.sequence }
}

const createManualBooking = async (propertySlug, payload) => {
//   const booking = await createGuestBooking({ ...payload, propertySlug })
const booking = await createGuestBooking({ ...payload, propertySlug, source: 'admin_manual' })

  if (payload.paymentCollected && payload.paymentCollected !== 'none') {
    const fullBooking = await Booking.findByPk(booking.id)
    const amount = Number(fullBooking.deposit_required) || Number(fullBooking.subtotal)

    await Payment.create({
      booking_id: fullBooking.id,
      provider: payload.paymentCollected === 'cash' ? 'cash' : 'mpesa',
      type: 'deposit',
      amount,
      currency: fullBooking.currency || 'KES',
      status: 'completed',
      initiated_at: new Date(),
      completed_at: new Date()
    })

    fullBooking.amount_paid = amount
    fullBooking.balance_due = Math.max(Number(fullBooking.subtotal) - amount, 0)
    fullBooking.status = 'confirmed'
    await fullBooking.save()

    return serializeBooking(fullBooking)
  }

  return booking
}

module.exports = {
  listBookings,
  getBooking,
  updateBookingStatus,
  assignRoom,
  createManualBooking
}