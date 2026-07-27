// const express = require('express')
// const router = express.Router()
// const authenticate = require('../../middlewares/authenticate')
// const requireRole = require('../../middlewares/requireRole')
// const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
// const { getAdminProperty } = require('../../controllers/property.controller')

// router.get(
//   '/',
//   authenticate,
//   requireRole('staff', 'admin', 'superadmin'),
//   resolveAdminProperty,
//   getAdminProperty
// )

// module.exports = router











const express = require('express')
const router = express.Router()
const authenticate = require('../../middlewares/authenticate')
const requireRole = require('../../middlewares/requireRole')
const resolveAdminProperty = require('../../middlewares/resolveAdminProperty')
const validate = require('../../middlewares/validate')
const { updatePropertySchema } = require('../../utils/validators/property.validator')
const { getAdminProperty, updateAdminProperty } = require('../../controllers/property.controller')

router.get('/', authenticate, requireRole('staff', 'admin', 'superadmin'), resolveAdminProperty, getAdminProperty)
router.patch('/', authenticate, requireRole('admin', 'superadmin'), resolveAdminProperty, validate(updatePropertySchema), updateAdminProperty)

module.exports = router