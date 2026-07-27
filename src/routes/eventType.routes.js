const express = require('express')
const router = express.Router()
const { listPublic } = require('../controllers/eventType.controller')

router.get('/', listPublic)

module.exports = router