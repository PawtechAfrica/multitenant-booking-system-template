const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/adminPayment.controller')
const { updateRefundStatusSchema } = require('../../utils/validators/payment.validator')

router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin', 'superadmin'),
  resolveAdminProperty,
  validate(updateRefundStatusSchema),
  controller.updateRefundStatus
)

module.exports = router