const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const staffController = require('../../controllers/staff.controller')
const {
  createStaffSchema,
  updateStaffSchema,
  listStaffQuerySchema
} = require('../../utils/validators/staff.validator')

router.use(authenticate, requireRole('superadmin'))

router.get('/', validateQuery(listStaffQuerySchema), staffController.list)
router.post('/', validate(createStaffSchema), staffController.create)
router.patch('/:id', validate(updateStaffSchema), staffController.update)
router.delete('/:id', staffController.deactivate)

module.exports = router