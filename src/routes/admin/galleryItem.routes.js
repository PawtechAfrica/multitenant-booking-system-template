const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const controller = require('../../controllers/galleryItem.controller')
const {
  createGalleryItemSchema,
  updateGalleryItemSchema,
  reorderSchema,
  listGalleryQuerySchema
} = require('../../utils/validators/galleryItem.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', validateQuery(listGalleryQuerySchema), controller.listAdmin)
router.post('/', requireRole('admin', 'superadmin'), validate(createGalleryItemSchema), controller.create)
router.patch('/reorder', requireRole('admin', 'superadmin'), validate(reorderSchema), controller.reorder)
router.patch('/:id', requireRole('admin', 'superadmin'), validate(updateGalleryItemSchema), controller.update)
router.delete('/:id', requireRole('admin', 'superadmin'), controller.remove)

module.exports = router