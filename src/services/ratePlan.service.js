const { RatePlan, RoomType, CancellationPolicy } = require('../database/models')
const AppError = require('../utils/AppError')

const serializeRatePlan = (rp) => ({
  id: rp.id,
  propertyId: rp.property_id,
  roomTypeId: rp.room_type_id,
  name: rp.name,
  priceOverride: rp.price_override,
  cancellationPolicyId: rp.cancellation_policy_id,
  validFrom: rp.valid_from,
  validTo: rp.valid_to,
  isActive: rp.is_active
})

const assertRoomTypeBelongs = async (propertyId, roomTypeId) => {
  const roomType = await RoomType.findOne({ where: { id: roomTypeId, property_id: propertyId } })
  if (!roomType) {
    throw new AppError('Room type not found.', 404, 'ROOM_TYPE_NOT_FOUND')
  }
}

const assertPolicyBelongs = async (propertyId, policyId) => {
  if (!policyId) return
  const policy = await CancellationPolicy.findOne({ where: { id: policyId, property_id: propertyId } })
  if (!policy) {
    throw new AppError('Cancellation policy not found.', 404, 'VALIDATION_ERROR')
  }
}

const findOwnedRatePlan = async (propertyId, ratePlanId) => {
  const ratePlan = await RatePlan.findOne({ where: { id: ratePlanId, property_id: propertyId } })
  if (!ratePlan) {
    throw new AppError('Rate plan not found.', 404, 'VALIDATION_ERROR')
  }
  return ratePlan
}

const listRatePlans = async (propertyId, roomTypeId) => {
  const where = { property_id: propertyId }
  if (roomTypeId) where.room_type_id = roomTypeId

  const ratePlans = await RatePlan.findAll({ where, order: [['valid_from', 'DESC']] })
  return ratePlans.map(serializeRatePlan)
}

const createRatePlan = async (propertyId, payload) => {
  await assertRoomTypeBelongs(propertyId, payload.roomTypeId)
  await assertPolicyBelongs(propertyId, payload.cancellationPolicyId)

  const ratePlan = await RatePlan.create({
    property_id: propertyId,
    room_type_id: payload.roomTypeId,
    name: payload.name,
    price_override: payload.priceOverride,
    cancellation_policy_id: payload.cancellationPolicyId || null,
    valid_from: payload.validFrom,
    valid_to: payload.validTo
  })

  return serializeRatePlan(ratePlan)
}

const updateRatePlan = async (propertyId, ratePlanId, payload) => {
  const ratePlan = await findOwnedRatePlan(propertyId, ratePlanId)

  if (payload.cancellationPolicyId !== undefined) {
    await assertPolicyBelongs(propertyId, payload.cancellationPolicyId)
    ratePlan.cancellation_policy_id = payload.cancellationPolicyId
  }
  if (payload.name !== undefined) ratePlan.name = payload.name
  if (payload.priceOverride !== undefined) ratePlan.price_override = payload.priceOverride
  if (payload.validFrom !== undefined) ratePlan.valid_from = payload.validFrom
  if (payload.validTo !== undefined) ratePlan.valid_to = payload.validTo
  if (payload.isActive !== undefined) ratePlan.is_active = payload.isActive

  await ratePlan.save()
  return serializeRatePlan(ratePlan)
}

const deleteRatePlan = async (propertyId, ratePlanId) => {
  const ratePlan = await findOwnedRatePlan(propertyId, ratePlanId)
  await ratePlan.destroy()
}

module.exports = { listRatePlans, createRatePlan, updateRatePlan, deleteRatePlan }