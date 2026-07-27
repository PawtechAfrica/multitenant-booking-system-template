const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')
const authenticate = require('../middlewares/authenticate')
const validate = require('../middlewares/validate')
const { registerSchema, loginSchema, refreshSchema } = require('../utils/validators/auth.validator')

router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshSchema), authController.refresh)
router.post('/logout', validate(refreshSchema), authController.logout)
router.get('/me', authenticate, authController.me)

module.exports = router