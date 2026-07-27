const multer = require('multer')
const AppError = require('../utils/AppError')

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, or WEBP images are allowed.', 400, 'VALIDATION_ERROR'))
  }
  cb(null, true)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } })

module.exports = upload