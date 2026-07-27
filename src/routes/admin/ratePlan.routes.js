const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/ratePlan.controller')
const { createRatePlanSchema, updateRatePlanSchema } = require('../../utils/validators/ratePlan.validator')

router.use(authenticate, requireRole('admin', 'superadmin'), resolveAdminProperty)

router.get('/', controller.list)
router.post('/', validate(createRatePlanSchema), controller.create)
router.patch('/:id', validate(updateRatePlanSchema), controller.update)
router.delete('/:id', controller.remove)

module.exports = router