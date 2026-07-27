const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/eventType.controller')
const {
  createEventTypeSchema,
  updateEventTypeSchema,
  reorderSchema
} = require('../../utils/validators/eventType.validator')

router.use(
  authenticate,
  requireRole('staff', 'admin', 'superadmin'),
  resolveAdminProperty
)

router.get('/', controller.listAdmin)
router.post(
  '/',
  requireRole('admin', 'superadmin'),
  validate(createEventTypeSchema),
  controller.create
)
router.patch(
  '/reorder',
  requireRole('admin', 'superadmin'),
  validate(reorderSchema),
  controller.reorder
)
router.patch(
  '/:id',
  requireRole('admin', 'superadmin'),
  validate(updateEventTypeSchema),
  controller.update
)
router.delete('/:id', requireRole('admin', 'superadmin'), controller.remove)

module.exports = router

// Route order matters here: /reorder must be registered before /:id, or Express will try to match "reorder" as an :id param instead.
