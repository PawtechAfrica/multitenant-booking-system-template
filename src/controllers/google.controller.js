const GoogleService = require('../services/google.service')

class GoogleController {
  static async adminOnboarding(req, res, next) {
    try {
      const user = await GoogleService.adminOnboarding(req.body)

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: user
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = GoogleController