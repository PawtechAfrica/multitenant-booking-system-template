const { Op } = require('sequelize')
const {
  Property,
  RoomType,
  Booking,
  BookingRoom,
  CancellationPolicy
} = require('../database/models')
const AppError = require('../utils/AppError')
const notificationService = require('./notification.service')

const { generateBookingCode } = require('../utils/bookingCode')
const { computeCancellationDeadline } = require('../utils/cancellationPolicy')
const {
  getOverlapCount,
  findActiveRatePlan,
  resolvePrice
} = require('./availability.service')

const HOLD_MINUTES = parseInt(process.env.BOOKING_HOLD_MINUTES || '30', 10)

const serializeBooking = booking => ({
  id: booking.id,
  bookingCode: booking.booking_code,
  propertyId: booking.property_id,
  roomTypeId: booking.room_type_id,
  guestFirstName: booking.guest_first_name,
  guestLastName: booking.guest_last_name,
  guestEmail: booking.guest_email,
  guestPhone: booking.guest_phone,
  checkInDate: booking.check_in_date,
  checkOutDate: booking.check_out_date,
  numAdults: booking.num_adults,
  numChildren: booking.num_children,
  numRooms: booking.num_rooms,
  specialRequests: booking.special_requests,
  status: booking.status,
  subtotal: booking.subtotal,
  depositRequired: booking.deposit_required,
  amountPaid: booking.amount_paid,
  balanceDue: booking.balance_due,
  currency: booking.currency || 'KES',
  cancellationDeadlineAt: booking.cancellation_deadline_at,
  expiresAt: booking.expires_at
})

const getCancellationPolicy = async (
  propertyId,
  roomTypeId,
  checkIn,
  checkOut
) => {
  const ratePlan = await findActiveRatePlan(roomTypeId, checkIn, checkOut)

  if (ratePlan && ratePlan.cancellation_policy_id) {
    const policy = await CancellationPolicy.findByPk(
      ratePlan.cancellation_policy_id
    )
    if (policy) return policy
  }

  return CancellationPolicy.findOne({
    where: { property_id: propertyId, is_default: true }
  })
}

const createBooking = async payload => {
  const property = await Property.findOne({
    where: { slug: payload.propertySlug, is_active: true }
  })
  if (!property) {
    throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')
  }

  const roomType = await RoomType.findOne({
    where: { id: payload.roomTypeId, property_id: property.id, is_active: true }
  })
  if (!roomType) {
    throw new AppError('Room type not found.', 404, 'ROOM_TYPE_NOT_FOUND')
  }

  const checkIn = payload.checkInDate
  const checkOut = payload.checkOutDate

  const overlappingCount = await getOverlapCount(roomType.id, checkIn, checkOut)
  const availableUnits = roomType.total_units - overlappingCount

  if (availableUnits < payload.numRooms) {
    throw new AppError(
      'No rooms of this type available for the selected dates.',
      409,
      'BOOKING_NOT_AVAILABLE'
    )
  }

  const nights = Math.round(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  )
  const pricePerNight = await resolvePrice(roomType, checkIn, checkOut)
  const subtotal = pricePerNight * nights * payload.numRooms

  const policy = await getCancellationPolicy(
    property.id,
    roomType.id,
    checkIn,
    checkOut
  )
  const depositPct =
    policy && policy.deposit_pct != null ? Number(policy.deposit_pct) : 0
  const depositRequired = Math.round(subtotal * (depositPct / 100) * 100) / 100
  const cancellationDeadlineAt = policy
    ? computeCancellationDeadline(policy.tiers, checkIn)
    : null

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + HOLD_MINUTES)

  let booking
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      booking = await Booking.create({
        booking_code: generateBookingCode(property.slug),
        property_id: property.id,
        room_type_id: roomType.id,
        user_id: null,
        guest_first_name: payload.guestFirstName,
        guest_last_name: payload.guestLastName,
        guest_email: payload.guestEmail,
        guest_phone: payload.guestPhone,
        check_in_date: checkIn,
        check_out_date: checkOut,
        num_adults: payload.numAdults,
        num_children: payload.numChildren,
        num_rooms: payload.numRooms,
        special_requests: payload.specialRequests,
        status: 'pending_payment',
        subtotal,
        deposit_required: depositRequired,
        amount_paid: 0,
        balance_due: subtotal,
        cancellation_deadline_at: cancellationDeadlineAt,
        // source: 'web',
        source: payload.source || 'web',
        expires_at: expiresAt
      })
      break
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' && attempt < 2) continue
      throw err
    }
  }

  const bookingRoomRows = Array.from({ length: payload.numRooms }, (_, i) => ({
    booking_id: booking.id,
    room_type_id: roomType.id,
    room_id: null,
    sequence: i + 1
  }))
  await BookingRoom.bulkCreate(bookingRoomRows)

  return serializeBooking(booking)
}

const findBookingByCodeForGuest = async (bookingCode, email) => {
  const booking = await Booking.findOne({
    where: { booking_code: bookingCode }
  })

  if (!booking || booking.guest_email.toLowerCase() !== email.toLowerCase()) {
    throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND')
  }

  return booking
}

const getBookingForGuest = async (bookingCode, email) => {
  const booking = await findBookingByCodeForGuest(bookingCode, email)
  return serializeBooking(booking)
}

const cancelBookingForGuest = async (bookingCode, email) => {
  const booking = await findBookingByCodeForGuest(bookingCode, email)

  if (
    ['cancelled', 'checked_out', 'no_show', 'expired'].includes(booking.status)
  ) {
    throw new AppError(
      'This booking can no longer be cancelled.',
      409,
      'CANCELLATION_WINDOW_CLOSED'
    )
  }

  if (
    booking.cancellation_deadline_at &&
    new Date() > new Date(booking.cancellation_deadline_at)
  ) {
    throw new AppError(
      'The free-cancellation window for this booking has passed.',
      409,
      'CANCELLATION_WINDOW_CLOSED'
    )
  }

  booking.status = 'cancelled'
  await booking.save()

  await notificationService.sendBookingStatusEmail(booking.id, 'cancelled')
  return serializeBooking(booking)
}

module.exports = {
  createBooking,
  getBookingForGuest,
  cancelBookingForGuest,
  serializeBooking
}
