const { Property, Inquiry } = require('../database/models')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const serializeInquiry = (inq) => ({
  id: inq.id,
  propertyId: inq.property_id,
  type: inq.type,
  name: inq.name,
  email: inq.email,
  phone: inq.phone,
  message: inq.message,
  partySize: inq.party_size,
  preferredDate: inq.preferred_date,
  status: inq.status,
  createdAt: inq.created_at
})

const createInquiry = async (payload) => {
  const property = await Property.findOne({ where: { slug: payload.propertySlug, is_active: true } })
  if (!property) throw new AppError('Property not found.', 404, 'PROPERTY_NOT_FOUND')

  const inquiry = await Inquiry.create({
    property_id: property.id,
    type: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    party_size: payload.partySize,
    preferred_date: payload.preferredDate
  })

  return serializeInquiry(inquiry)
}

const listInquiries = async (propertyId, query) => {
  const { page, pageSize, offset, limit } = parsePagination(query)
  const where = { property_id: propertyId }
  if (query.type) where.type = query.type
  if (query.status) where.status = query.status

  const { rows, count } = await Inquiry.findAndCountAll({
    where, order: [['created_at', 'DESC']], limit, offset
  })

  return { data: rows.map(serializeInquiry), meta: { total: count, page, pageSize } }
}

const getInquiry = async (propertyId, id) => {
  const inquiry = await Inquiry.findOne({ where: { id, property_id: propertyId } })
  if (!inquiry) throw new AppError('Inquiry not found.', 404, 'VALIDATION_ERROR')
  return serializeInquiry(inquiry)
}

const updateStatus = async (propertyId, id, status) => {
  const inquiry = await Inquiry.findOne({ where: { id, property_id: propertyId } })
  if (!inquiry) throw new AppError('Inquiry not found.', 404, 'VALIDATION_ERROR')

  inquiry.status = status
  await inquiry.save()
  return serializeInquiry(inquiry)
}

module.exports = { createInquiry, listInquiries, getInquiry, updateStatus }