const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const controller = require('../../controllers/adminPayment.controller')
const {
  listPaymentsQuerySchema,
  createRefundSchema
} = require('../../utils/validators/payment.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', validateQuery(listPaymentsQuerySchema), controller.list)
router.post('/:id/refund', requireRole('admin', 'superadmin'), validate(createRefundSchema), controller.refund)

module.exports = router