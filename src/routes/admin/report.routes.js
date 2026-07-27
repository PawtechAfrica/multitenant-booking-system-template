const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validateQuery = require('../../middlewares/validateQuery')
const controller = require('../../controllers/report.controller')
const { dateRangeSchema } = require('../../utils/validators/report.validator')

router.use(authenticate, requireRole('admin', 'superadmin'), resolveAdminProperty)

router.get('/occupancy', validateQuery(dateRangeSchema), controller.occupancy)
router.get('/revenue', validateQuery(dateRangeSchema), controller.revenue)

module.exports = router