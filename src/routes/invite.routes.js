const express = require('express')
const router = express.Router()

const validate = require('../middlewares/validate')
const { acceptInviteSchema } = require('../utils/validators/invite.validator')
const controller = require('../controllers/staffInvite.controller')

router.get('/:token', controller.getInvite)
router.post('/accept', validate(acceptInviteSchema), controller.accept)

module.exports = router