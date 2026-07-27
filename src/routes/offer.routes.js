const express = require('express')
const router = express.Router()
const { listPublic } = require('../controllers/offer.controller')

router.get('/', listPublic)

module.exports = router