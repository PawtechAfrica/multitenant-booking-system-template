const express = require('express')
const router = express.Router()
const roomTypeController = require('../controllers/roomType.controller')

router.get('/', roomTypeController.listPublic)
router.get('/:roomTypeSlug', roomTypeController.getPublicDetail)

module.exports = router