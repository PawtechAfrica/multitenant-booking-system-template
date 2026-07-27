const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  if (err.name === 'SequelizeUniqueConstraintError') {
  return res.status(409).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'That value is already in use.' }
  })

}

if (err.name === 'MulterError') {
  return res.status(400).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: err.message }
  })
}


  const code = err.code || 'INTERNAL_ERROR'
  const message = statusCode === 500 ? 'Something went wrong.' : err.message

  if (statusCode === 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message }
  })
}

module.exports = errorHandler