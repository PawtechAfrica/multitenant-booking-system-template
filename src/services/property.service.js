const serializeProperty = (property) => ({
  id: property.id,
  slug: property.slug,
  name: property.name,
  timezone: property.timezone,
  currency: property.currency,
  contactEmail: property.contact_email,
  contactPhone: property.contact_phone,
  address: property.address,
  checkInTime: property.check_in_time,
  checkOutTime: property.check_out_time,
  isActive: property.is_active
})

module.exports = { serializeProperty }