const express = require('express')
const router = express.Router()

const validate = require('../middlewares/validate')
const validateQuery = require('../middlewares/validateQuery')
const bookingController = require('../controllers/booking.controller')
const {
  createBookingSchema,
  lookupBookingQuerySchema,
  cancelBookingSchema
} = require('../utils/validators/booking.validator')

router.post('/', validate(createBookingSchema), bookingController.create)
router.get('/:bookingCode', validateQuery(lookupBookingQuerySchema), bookingController.getByCode)
router.post('/:bookingCode/cancel', validate(cancelBookingSchema), bookingController.cancel)

module.exports = router