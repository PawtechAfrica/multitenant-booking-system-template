const AppError = require('../utils/AppError')

const verifyWebhookSecret = (req, res, next) => {
  const provided = req.headers['x-webhook-secret']
  if (!provided || provided !== process.env.GOOGLE_WEBHOOK_SECRET) {
    return next(new AppError('Invalid webhook secret.', 401, 'UNAUTHORIZED'))
  }
  next()
}

module.exports = verifyWebhookSecret