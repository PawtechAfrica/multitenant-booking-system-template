const { Op } = require('sequelize')
const { Offer } = require('../database/models')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const serializeOffer = (offer) => ({
  id: offer.id,
  propertyId: offer.property_id,
  title: offer.title,
  description: offer.description,
  discountType: offer.discount_type,
  discountValue: offer.discount_value,
  validFrom: offer.valid_from,
  validTo: offer.valid_to,
  imageUrl: offer.image_url,
  terms: offer.terms,
  isActive: offer.is_active
})

const findOwnedOffer = async (propertyId, offerId) => {
  const offer = await Offer.findOne({ where: { id: offerId, property_id: propertyId } })
  if (!offer) throw new AppError('Offer not found.', 404, 'VALIDATION_ERROR')
  return offer
}

// -- Public: only active AND currently within date range (or no dates set) --
const listPublicOffers = async (propertyId) => {
  const now = new Date()
  const offers = await Offer.findAll({
    where: {
      property_id: propertyId,
      is_active: true,
      [Op.and]: [
        { [Op.or]: [{ valid_from: null }, { valid_from: { [Op.lte]: now } }] },
        { [Op.or]: [{ valid_to: null }, { valid_to: { [Op.gte]: now } }] }
      ]
    },
    order: [['created_at', 'DESC']]
  })
  return offers.map(serializeOffer)
}

// -- Admin --
const listAdminOffers = async (propertyId, query) => {
  const { page, pageSize, offset, limit } = parsePagination(query)
  const { rows, count } = await Offer.findAndCountAll({
    where: { property_id: propertyId },
    order: [['created_at', 'DESC']],
    limit,
    offset
  })
  return { data: rows.map(serializeOffer), meta: { total: count, page, pageSize } }
}

const createOffer = async (propertyId, payload) => {
  const offer = await Offer.create({
    property_id: propertyId,
    title: payload.title,
    description: payload.description,
    discount_type: payload.discountType,
    discount_value: payload.discountValue,
    valid_from: payload.validFrom,
    valid_to: payload.validTo,
    image_url: payload.imageUrl,
    terms: payload.terms
  })
  return serializeOffer(offer)
}

const updateOffer = async (propertyId, offerId, payload) => {
  const offer = await findOwnedOffer(propertyId, offerId)
  const fieldMap = {
    title: 'title', description: 'description', discountType: 'discount_type',
    discountValue: 'discount_value', validFrom: 'valid_from', validTo: 'valid_to',
    imageUrl: 'image_url', terms: 'terms', isActive: 'is_active'
  }
  for (const [key, column] of Object.entries(fieldMap)) {
    if (payload[key] !== undefined) offer[column] = payload[key]
  }
  await offer.save()
  return serializeOffer(offer)
}

const deleteOffer = async (propertyId, offerId) => {
  const offer = await findOwnedOffer(propertyId, offerId)
  await offer.destroy()
}

module.exports = { listPublicOffers, listAdminOffers, createOffer, updateOffer, deleteOffer }