const { Op } = require('sequelize')
const { RoomType, Booking } = require('../database/models')

const HELD_STATUSES = ['confirmed', 'checked_in', 'checked_out']

const msPerDay = 1000 * 60 * 60 * 24

const overlappingNights = (bookingCheckIn, bookingCheckOut, rangeFrom, rangeTo) => {
  const start = new Date(Math.max(new Date(bookingCheckIn), new Date(rangeFrom)))
  const end = new Date(Math.min(new Date(bookingCheckOut), new Date(rangeTo)))
  const nights = Math.round((end - start) / msPerDay)
  return Math.max(nights, 0)
}

const getOccupancyReport = async (propertyId, { from, to }) => {
  const totalDays = Math.max(Math.round((new Date(to) - new Date(from)) / msPerDay), 1)

  const roomTypes = await RoomType.findAll({ where: { property_id: propertyId } })

  const results = await Promise.all(roomTypes.map(async (roomType) => {
    const bookings = await Booking.findAll({
      where: {
        room_type_id: roomType.id,
        status: { [Op.in]: HELD_STATUSES },
        check_in_date: { [Op.lt]: to },
        check_out_date: { [Op.gt]: from }
      },
      attributes: ['check_in_date', 'check_out_date', 'num_rooms']
    })

    const bookedRoomNights = bookings.reduce((sum, b) => {
      return sum + overlappingNights(b.check_in_date, b.check_out_date, from, to) * b.num_rooms
    }, 0)

    const availableRoomNights = roomType.total_units * totalDays
    const occupancyPct = availableRoomNights > 0
      ? Math.round((bookedRoomNights / availableRoomNights) * 10000) / 100
      : 0

    return {
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      bookedRoomNights,
      availableRoomNights,
      occupancyPct
    }
  }))

  return results
}

const getRevenueReport = async (propertyId, { from, to }) => {
  const roomTypes = await RoomType.findAll({ where: { property_id: propertyId } })

  const results = await Promise.all(roomTypes.map(async (roomType) => {
    const bookings = await Booking.findAll({
      where: {
        room_type_id: roomType.id,
        check_in_date: { [Op.gte]: from, [Op.lte]: to },
        status: { [Op.notIn]: ['cancelled', 'expired'] }
      },
      attributes: ['subtotal', 'amount_paid']
    })

    const bookedRevenue = bookings.reduce((sum, b) => sum + Number(b.subtotal), 0)
    const collectedRevenue = bookings.reduce((sum, b) => sum + Number(b.amount_paid), 0)

    return {
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      bookedRevenue: Math.round(bookedRevenue * 100) / 100,
      collectedRevenue: Math.round(collectedRevenue * 100) / 100,
      outstandingRevenue: Math.round((bookedRevenue - collectedRevenue) * 100) / 100
    }
  }))

  return results
}

module.exports = { getOccupancyReport, getRevenueReport }