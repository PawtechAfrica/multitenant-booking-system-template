const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/offer.controller')
const { createOfferSchema, updateOfferSchema } = require('../../utils/validators/offer.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', controller.listAdmin)
router.post('/', requireRole('admin', 'superadmin'), validate(createOfferSchema), controller.create)
router.patch('/:id', requireRole('admin', 'superadmin'), validate(updateOfferSchema), controller.update)
router.delete('/:id', requireRole('admin', 'superadmin'), controller.remove)

module.exports = router