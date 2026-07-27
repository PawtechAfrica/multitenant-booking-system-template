const { GalleryItem, sequelize } = require('../database/models')
const AppError = require('../utils/AppError')

const serialize = (item) => ({
  id: item.id,
  propertyId: item.property_id,
  category: item.category,
  imageUrl: item.image_url,
  caption: item.caption,
  sortOrder: item.sort_order
})

const findOwned = async (propertyId, id) => {
  const item = await GalleryItem.findOne({ where: { id, property_id: propertyId } })
  if (!item) throw new AppError('Gallery item not found.', 404, 'VALIDATION_ERROR')
  return item
}

const listPublic = async (propertyId, category) => {
  const where = { property_id: propertyId }
  if (category) where.category = category

  const rows = await GalleryItem.findAll({ where, order: [['sort_order', 'ASC']] })
  return rows.map(serialize)
}

const listAdmin = async (propertyId, category) => {
  return listPublic(propertyId, category) // no is_active/inactive concept on this table -- same query
}

const create = async (propertyId, payload) => {
  const item = await GalleryItem.create({
    property_id: propertyId,
    category: payload.category,
    image_url: payload.imageUrl,
    caption: payload.caption,
    sort_order: payload.sortOrder
  })
  return serialize(item)
}

const update = async (propertyId, id, payload) => {
  const item = await findOwned(propertyId, id)

  if (payload.category !== undefined) item.category = payload.category
  if (payload.caption !== undefined) item.caption = payload.caption
  if (payload.sortOrder !== undefined) item.sort_order = payload.sortOrder

  await item.save()
  return serialize(item)
}

const remove = async (propertyId, id) => {
  const item = await findOwned(propertyId, id)
  await item.destroy() // no soft-delete flag on this table, per schema -- a real delete
}

const reorder = async (propertyId, items) => {
  await sequelize.transaction(async (t) => {
    for (const entry of items) {
      const [count] = await GalleryItem.update(
        { sort_order: entry.sortOrder },
        { where: { id: entry.id, property_id: propertyId }, transaction: t }
      )
      if (count === 0) {
        throw new AppError(`Gallery item ${entry.id} not found.`, 404, 'VALIDATION_ERROR')
      }
    }
  })
}

module.exports = { listPublic, listAdmin, create, update, remove, reorder }