const express = require('express')
const router = express.Router()

const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const upload = require('../../middlewares/upload')
const controller = require('../../controllers/media.controller')

router.post(
  '/upload',
  authenticate,
  requireRole('admin', 'superadmin'),
  resolveAdminProperty,
  upload.single('file'),
  controller.upload
)

module.exports = router