const router = require('express').Router()
const verifyWebhookSecret = require('../middlewares/verifyWebhookSecret')

const GoogleController = require('../controllers/google.controller')

router.post(
  '/admin-onboarding',
  verifyWebhookSecret,
  GoogleController.adminOnboarding
)

// router.post('/admin-onboarding', GoogleController.adminOnboarding)

module.exports = router
