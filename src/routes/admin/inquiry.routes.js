const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const controller = require('../../controllers/inquiry.controller')
const { updateInquiryStatusSchema, listInquiriesQuerySchema } = require('../../utils/validators/inquiry.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', validateQuery(listInquiriesQuerySchema), controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id/status', validate(updateInquiryStatusSchema), controller.updateStatus)

module.exports = router