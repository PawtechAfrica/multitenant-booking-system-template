const router = require('express').Router()

const GoogleController = require('../controllers/google.controller')

router.post(
  '/admin-onboarding',
  GoogleController.adminOnboarding
)

module.exports = router