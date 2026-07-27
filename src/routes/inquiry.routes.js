const express = require('express')
const router = express.Router()
const validate = require('../middlewares/validate')
const { createInquirySchema } = require('../utils/validators/inquiry.validator')
const controller = require('../controllers/inquiry.controller')

router.post('/', validate(createInquirySchema), controller.create)

module.exports = router