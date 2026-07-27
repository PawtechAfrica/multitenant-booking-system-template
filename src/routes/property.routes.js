const express = require('express')
const router = express.Router()
const resolveProperty = require('../middlewares/resolveProperty')
const { getPublicProperty } = require('../controllers/property.controller')

router.get('/:propertySlug', resolveProperty, getPublicProperty)

module.exports = router