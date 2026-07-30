const SANDBOX_MODE = process.env.EMAIL_SANDBOX_MODE !== 'false' // defaults to true until you explicitly turn it off

const SENDERS = {
  'centurion-hotel': {
    name: 'Centurion Hotel',
    from: process.env.RESEND_FROM_CENTURION_HOTEL
  },
  'mums-garden-resort': {
    name: "Mum's Garden Resort",
    from: process.env.RESEND_FROM_MUMS_GARDEN_RESORT
  }
}

const FALLBACK = { name: 'Booking Team', from: process.env.RESEND_SANDBOX_FROM }

const getSender = propertySlug => {
  if (SANDBOX_MODE) {
    const known = SENDERS[propertySlug]
    return {
      name: known ? known.name : FALLBACK.name,
      from: process.env.RESEND_SANDBOX_FROM
    }
  }
  return SENDERS[propertySlug] || FALLBACK
}

module.exports = { getSender, SANDBOX_MODE }
