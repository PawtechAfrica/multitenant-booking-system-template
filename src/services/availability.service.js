const { Op } = require('sequelize')
const { RoomType, Booking, RatePlan } = require('../database/models')

const HELD_STATUSES = ['pending_payment', 'confirmed', 'checked_in']

const getOverlapCount = async (roomTypeId, checkIn, checkOut) => {
  return Booking.count({
    where: {
      room_type_id: roomTypeId,
      status: { [Op.in]: HELD_STATUSES },
      check_in_date: { [Op.lt]: checkOut },
      check_out_date: { [Op.gt]: checkIn }
    }
  })
}

const findActiveRatePlan = async (roomTypeId, checkIn, checkOut) => {
  return RatePlan.findOne({
    where: {
      room_type_id: roomTypeId,
      is_active: true,
      valid_from: { [Op.lte]: checkIn },
      valid_to: { [Op.gte]: checkOut }
    },
    order: [['created_at', 'DESC']]
  })
}

const resolvePrice = async (roomType, checkIn, checkOut) => {
  const ratePlan = await findActiveRatePlan(roomType.id, checkIn, checkOut)

  if (ratePlan && ratePlan.price_override != null) {
    return Number(ratePlan.price_override)
  }

  return Number(roomType.base_price)
}

const getAvailability = async (propertyId, { checkIn, checkOut, adults, children }) => {
  const roomTypes = await RoomType.findAll({
    where: { property_id: propertyId, is_active: true },
    order: [['base_price', 'ASC']]
  })

  const results = await Promise.all(roomTypes.map(async (roomType) => {
    const overlappingCount = await getOverlapCount(roomType.id, checkIn, checkOut)
    const availableUnits = Math.max(roomType.total_units - overlappingCount, 0)
    const resolvedPrice = await resolvePrice(roomType, checkIn, checkOut)
    const fitsPartySize = adults <= roomType.max_adults && children <= (roomType.max_children || 0)

    return {
      roomTypeId: roomType.id,
      slug: roomType.slug,
      name: roomType.name,
      availableUnits,
      resolvedPrice,
      currency: roomType.currency,
      fitsPartySize
    }
  }))

  return results
}

module.exports = { getAvailability, getOverlapCount, findActiveRatePlan, resolvePrice }