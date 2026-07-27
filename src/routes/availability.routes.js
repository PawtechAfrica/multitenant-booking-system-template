const express = require('express')
const router = express.Router()

const validateQuery = require('../middlewares/validateQuery')
const { availabilityQuerySchema } = require('../utils/validators/availability.validator')
const availabilityController = require('../controllers/availability.controller')

router.get('/', validateQuery(availabilityQuerySchema), availabilityController.getAvailability)

module.exports = router




// Using the deluxe-room room type you created for Centurion (totalUnits: 8):

// GET /api/v1/properties/centurion-hotel/availability?checkIn=2026-08-10&checkOut=2026-08-12&adults=2
// → should return the room type with availableUnits: 8 (nothing booked yet), resolvedPrice: 8500, fitsPartySize: true
// GET /api/v1/properties/centurion-hotel/availability?checkIn=2026-08-10&checkOut=2026-08-09 (checkOut before checkIn)
// → 400 VALIDATION_ERROR
// GET /api/v1/properties/centurion-hotel/availability?checkIn=2026-08-10&checkOut=2026-08-12&adults=5
// → same room type, but fitsPartySize: false (max is 2 adults)
// Manually insert a test row into bookings (via a quick script or psql) with room_type_id = your deluxe room's id, status='confirmed', dates overlapping Aug 10–12, and re-run query 1 → availableUnits should now read 7.
// Insert 7 more overlapping bookings (any status in pending_payment/confirmed/checked_in) so all 8 units are taken → availableUnits: 0.