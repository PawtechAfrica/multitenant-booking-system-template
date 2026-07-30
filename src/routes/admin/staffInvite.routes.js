const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const validate = require('../../middlewares/validate')
const controller = require('../../controllers/staffInvite.controller')
const { invitePendingUserSchema } = require('../../utils/validators/invite.validator')

router.use(authenticate, requireRole('superadmin'))

router.get('/pending', controller.listPending)
router.post('/pending/:id/invite', validate(invitePendingUserSchema), controller.invite)
router.delete('/pending/:id', controller.reject)

module.exports = router