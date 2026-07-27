'use strict'
const bcrypt = require('bcrypt')

module.exports = {
  up: async (queryInterface) => {
    const password_hash = await bcrypt.hash('Password123!', 10)

    await queryInterface.bulkInsert('users', [
      {
        id: 'f1a1a1a1-0000-0000-0000-000000000001',
        email: 'admin@centurion.com',
        password_hash,
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
        property_id: 'b3ac1eab-5b2d-4e2a-9c1a-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'f1a1a1a1-0000-0000-0000-000000000002',
        email: 'ops@straightgroup.test',
        password_hash,
        first_name: 'Test',
        last_name: 'Superadmin',
        role: 'superadmin',
        property_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: ['admin@centurion.test', 'ops@straightgroup.test'] })
  }
}