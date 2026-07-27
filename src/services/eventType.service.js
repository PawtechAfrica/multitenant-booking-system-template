const { EventType, sequelize } = require('../database/models')
const AppError = require('../utils/AppError')

const serializeEventType = (et) => ({
  id: et.id,
  propertyId: et.property_id,
  title: et.title,
  description: et.description,
  imageUrl: et.image_url,
  icon: et.icon,
  sortOrder: et.sort_order,
  isActive: et.is_active
})

const findOwned = async (propertyId, id) => {
  const et = await EventType.findOne({ where: { id, property_id: propertyId } })
  if (!et) throw new AppError('Event type not found.', 404, 'VALIDATION_ERROR')
  return et
}

const listPublic = async (propertyId) => {
  const rows = await EventType.findAll({
    where: { property_id: propertyId, is_active: true },
    order: [['sort_order', 'ASC']]
  })
  return rows.map(serializeEventType)
}

const listAdmin = async (propertyId) => {
  const rows = await EventType.findAll({
    where: { property_id: propertyId },
    order: [['sort_order', 'ASC']]
  })
  return rows.map(serializeEventType)
}

const create = async (propertyId, payload) => {
  const et = await EventType.create({
    property_id: propertyId,
    title: payload.title,
    description: payload.description,
    image_url: payload.imageUrl,
    icon: payload.icon,
    sort_order: payload.sortOrder
  })
  return serializeEventType(et)
}

const update = async (propertyId, id, payload) => {
  const et = await findOwned(propertyId, id)
  const fieldMap = {
    title: 'title', description: 'description', imageUrl: 'image_url',
    icon: 'icon', sortOrder: 'sort_order', isActive: 'is_active'
  }
  for (const [key, column] of Object.entries(fieldMap)) {
    if (payload[key] !== undefined) et[column] = payload[key]
  }
  await et.save()
  return serializeEventType(et)
}

// soft delete per spec (retired, not removed)
const remove = async (propertyId, id) => {
  const et = await findOwned(propertyId, id)
  et.is_active = false
  await et.save()
}

const reorder = async (propertyId, items) => {
  await sequelize.transaction(async (t) => {
    for (const item of items) {
      const [count] = await EventType.update(
        { sort_order: item.sortOrder },
        { where: { id: item.id, property_id: propertyId }, transaction: t }
      )
      if (count === 0) {
        throw new AppError(`Event type ${item.id} not found.`, 404, 'VALIDATION_ERROR')
      }
    }
  })
}

module.exports = { listPublic, listAdmin, create, update, remove, reorder }