const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/cancellationPolicy.controller')
const { createPolicySchema, updatePolicySchema } = require('../../utils/validators/cancellationPolicy.validator')

router.use(authenticate, requireRole('admin', 'superadmin'), resolveAdminProperty)

router.get('/', controller.list)
router.post('/', validate(createPolicySchema), controller.create)
router.patch('/:id', validate(updatePolicySchema), controller.update)
router.delete('/:id', controller.remove)
router.patch('/:id/set-default', controller.makeDefault)

module.exports = router