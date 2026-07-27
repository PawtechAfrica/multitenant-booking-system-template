const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const validateQuery = require('../../middlewares/validateQuery')
const controller = require('../../controllers/room.controller')
const {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  listRoomsQuerySchema
} = require('../../utils/validators/room.validator')

router.use(authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty)

router.get('/', validateQuery(listRoomsQuerySchema), controller.list)
router.post('/', requireRole('admin', 'superadmin'), validate(createRoomSchema), controller.create)
router.patch('/:id', requireRole('admin', 'superadmin'), validate(updateRoomSchema), controller.update)
router.patch('/:id/status', requireRole('admin', 'superadmin'), validate(updateRoomStatusSchema), controller.updateStatus)
router.delete('/:id', requireRole('admin', 'superadmin'), controller.remove)

module.exports = router