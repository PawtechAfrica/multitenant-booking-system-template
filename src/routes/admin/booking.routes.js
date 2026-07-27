const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const adminBookingController = require('../../controllers/adminBooking.controller')
const {
  listBookingsQuerySchema,
  updateStatusSchema,
  assignRoomSchema,
  manualBookingSchema
} = require('../../utils/validators/adminBooking.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', validateQuery(listBookingsQuerySchema), adminBookingController.list)
router.post('/manual', validate(manualBookingSchema), adminBookingController.createManual)
router.get('/:id', adminBookingController.getOne)
router.patch('/:id/status', validate(updateStatusSchema), adminBookingController.updateStatus)
router.post('/:id/assign-room', validate(assignRoomSchema), adminBookingController.assignRoom)

module.exports = router