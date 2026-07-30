const { User } = require('../database/models')
const AppError = require('../utils/AppError')

class GoogleService {
  static async adminOnboarding (data) {
    console.log('📥 adminOnboarding called with:', data)

    const { first_name, last_name, email, phone } = data

    if (!first_name || !last_name || !email) {
      console.log('❌ Validation failed:', {
        first_name,
        last_name,
        email
      })

      throw new AppError(
        'First name, last name and email are required.',
        400,
        'VALIDATION_ERROR'
      )
    }

    console.log(`🔍 Checking if user exists: ${email}`)

    const existingUser = await User.findOne({
      where: {
        email
      }
    })

    console.log(
      '👤 Existing user:',
      existingUser ? existingUser.toJSON() : null
    )

    if (existingUser) {
      console.log('❌ User already exists')

      // throw new AppError('A user with this email already exists.', 409)
      throw new AppError('A user with this email already exists.', 409, 'VALIDATION_ERROR')
    }

    console.log('➕ Creating new admin user...')

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,

      role: 'admin',

      password_hash: null,

      is_active: false
    })

    console.log('✅ User created:', user.toJSON())

    return user
  }
}

module.exports = GoogleService
