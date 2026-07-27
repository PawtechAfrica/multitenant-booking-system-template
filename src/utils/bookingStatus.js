const ALLOWED_TRANSITIONS = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
  no_show: [],
  expired: []
}

const canTransition = (from, to) => {
  return Array.isArray(ALLOWED_TRANSITIONS[from]) && ALLOWED_TRANSITIONS[from].includes(to)
}

module.exports = { canTransition, ALLOWED_TRANSITIONS }