const express = require('express')
const router = express.Router()
const validateQuery = require('../middlewares/validateQuery')
const { listGalleryQuerySchema } = require('../utils/validators/galleryItem.validator')
const { listPublic } = require('../controllers/galleryItem.controller')

router.get('/', validateQuery(listGalleryQuerySchema), listPublic)

module.exports = router