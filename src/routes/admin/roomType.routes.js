const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const roomTypeController = require('../../controllers/roomType.controller')
const {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  createImageSchema,
  updateImageSchema
} = require('../../utils/validators/roomType.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', roomTypeController.listAdmin)
router.post('/', requireRole('admin', 'superadmin'), validate(createRoomTypeSchema), roomTypeController.createAdmin)
router.get('/:id', roomTypeController.getAdmin)
router.patch('/:id', requireRole('admin', 'superadmin'), validate(updateRoomTypeSchema), roomTypeController.updateAdmin)
router.delete('/:id', requireRole('admin', 'superadmin'), roomTypeController.deleteAdmin)

router.post('/:id/images', requireRole('admin', 'superadmin'), validate(createImageSchema), roomTypeController.addImage)
router.patch('/:id/images/:imageId', requireRole('admin', 'superadmin'), validate(updateImageSchema), roomTypeController.updateImage)
router.delete('/:id/images/:imageId', requireRole('admin', 'superadmin'), roomTypeController.deleteImage)

module.exports = router