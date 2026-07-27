const express = require('express')
const router = express.Router()

const validate = require('../middlewares/validate')
const { stkPushSchema } = require('../utils/validators/payment.validator')
const paymentController = require('../controllers/payment.controller')

router.post('/mpesa/stkpush', validate(stkPushSchema), paymentController.stkPush)
router.post('/mpesa/callback', paymentController.callback) // Daraja -> server only, no auth
router.get('/:bookingCode/status', paymentController.status)

module.exports = router