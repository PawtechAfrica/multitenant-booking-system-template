const { RoomType, RoomTypeImage } = require('../database/models')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const serializeImage = (image) => ({
  id: image.id,
  url: image.url,
  altText: image.alt_text,
  sortOrder: image.sort_order,
  isCover: image.is_cover
})

const serializeRoomType = (roomType) => ({
  id: roomType.id,
  propertyId: roomType.property_id,
  slug: roomType.slug,
  name: roomType.name,
  description: roomType.description,
  sizeSqm: roomType.size_sqm,
  bedType: roomType.bed_type,
  maxAdults: roomType.max_adults,
  maxChildren: roomType.max_children,
  totalUnits: roomType.total_units,
  basePrice: roomType.base_price,
  currency: roomType.currency,
  attributes: roomType.attributes,
  isActive: roomType.is_active,
  images: (roomType.images || []).map(serializeImage)
})

const imageInclude = {
  model: RoomTypeImage,
  as: 'images',
  separate: true,
  order: [['sort_order', 'ASC']]
}

// -- Public --

const listPublicRoomTypes = async (propertyId) => {
  const roomTypes = await RoomType.findAll({
    where: { property_id: propertyId, is_active: true },
    include: [imageInclude],
    order: [['base_price', 'ASC']]
  })
  return roomTypes.map(serializeRoomType)
}

const getPublicRoomTypeBySlug = async (propertyId, slug) => {
  const roomType = await RoomType.findOne({
    where: { property_id: propertyId, slug, is_active: true },
    include: [imageInclude]
  })

  if (!roomType) {
    throw new AppError('Room type not found.', 404, 'ROOM_TYPE_NOT_FOUND')
  }

  return serializeRoomType(roomType)
}

// -- Admin --

const findOwnedRoomType = async (propertyId, roomTypeId) => {
  const roomType = await RoomType.findOne({
    where: { id: roomTypeId, property_id: propertyId },
    include: [imageInclude]
  })

  if (!roomType) {
    throw new AppError('Room type not found.', 404, 'ROOM_TYPE_NOT_FOUND')
  }

  return roomType
}

const listAdminRoomTypes = async (propertyId, query) => {
  const { page, pageSize, offset, limit } = parsePagination(query)

  const { rows, count } = await RoomType.findAndCountAll({
    where: { property_id: propertyId },
    include: [imageInclude],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true
  })

  return {
    data: rows.map(serializeRoomType),
    meta: { total: count, page, pageSize }
  }
}

const createRoomType = async (propertyId, payload) => {
  try {
    const roomType = await RoomType.create({
      property_id: propertyId,
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      size_sqm: payload.sizeSqm,
      bed_type: payload.bedType,
      max_adults: payload.maxAdults,
      max_children: payload.maxChildren,
      total_units: payload.totalUnits,
      base_price: payload.basePrice,
      currency: payload.currency,
      attributes: payload.attributes
    })

    return serializeRoomType(await findOwnedRoomType(propertyId, roomType.id))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('A room type with this slug already exists for this property.', 409, 'VALIDATION_ERROR')
    }
    throw err
  }
}

const getAdminRoomType = async (propertyId, roomTypeId) => {
  return serializeRoomType(await findOwnedRoomType(propertyId, roomTypeId))
}

const updateRoomType = async (propertyId, roomTypeId, payload) => {
  const roomType = await findOwnedRoomType(propertyId, roomTypeId)

  const fieldMap = {
    slug: 'slug',
    name: 'name',
    description: 'description',
    sizeSqm: 'size_sqm',
    bedType: 'bed_type',
    maxAdults: 'max_adults',
    maxChildren: 'max_children',
    totalUnits: 'total_units',
    basePrice: 'base_price',
    currency: 'currency',
    attributes: 'attributes',
    isActive: 'is_active'
  }

  for (const [key, column] of Object.entries(fieldMap)) {
    if (payload[key] !== undefined) roomType[column] = payload[key]
  }

  try {
    await roomType.save()
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('A room type with this slug already exists for this property.', 409, 'VALIDATION_ERROR')
    }
    throw err
  }

  return serializeRoomType(await findOwnedRoomType(propertyId, roomTypeId))
}

const softDeleteRoomType = async (propertyId, roomTypeId) => {
  const roomType = await findOwnedRoomType(propertyId, roomTypeId)
  roomType.is_active = false
  await roomType.save()
}

// -- Images --

const addImage = async (propertyId, roomTypeId, payload) => {
  await findOwnedRoomType(propertyId, roomTypeId) // ownership check

  if (payload.isCover) {
    await RoomTypeImage.update({ is_cover: false }, { where: { room_type_id: roomTypeId } })
  }

  const image = await RoomTypeImage.create({
    room_type_id: roomTypeId,
    url: payload.url,
    alt_text: payload.altText,
    sort_order: payload.sortOrder,
    is_cover: payload.isCover
  })

  return serializeImage(image)
}

const updateImage = async (propertyId, roomTypeId, imageId, payload) => {
  await findOwnedRoomType(propertyId, roomTypeId) // ownership check

  const image = await RoomTypeImage.findOne({ where: { id: imageId, room_type_id: roomTypeId } })
  if (!image) {
    throw new AppError('Image not found.', 404, 'VALIDATION_ERROR')
  }

  if (payload.isCover) {
    await RoomTypeImage.update({ is_cover: false }, { where: { room_type_id: roomTypeId } })
  }

  if (payload.altText !== undefined) image.alt_text = payload.altText
  if (payload.sortOrder !== undefined) image.sort_order = payload.sortOrder
  if (payload.isCover !== undefined) image.is_cover = payload.isCover

  await image.save()
  return serializeImage(image)
}

const deleteImage = async (propertyId, roomTypeId, imageId) => {
  await findOwnedRoomType(propertyId, roomTypeId) // ownership check

  const deleted = await RoomTypeImage.destroy({ where: { id: imageId, room_type_id: roomTypeId } })
  if (!deleted) {
    throw new AppError('Image not found.', 404, 'VALIDATION_ERROR')
  }
}

module.exports = {
  listPublicRoomTypes,
  getPublicRoomTypeBySlug,
  listAdminRoomTypes,
  createRoomType,
  getAdminRoomType,
  updateRoomType,
  softDeleteRoomType,
  addImage,
  updateImage,
  deleteImage
}