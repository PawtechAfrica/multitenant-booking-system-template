'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('properties', [
      {
        id: 'b3ac1eab-5b2d-4e2a-9c1a-111111111111',
        slug: 'centurion-hotel',
        name: 'Centurion Hotel',
        timezone: 'Africa/Nairobi',
        currency: 'KES',
        contact_email: 'info@centurionhotel.co.ke',
        contact_phone: '+254700000001',
        address: 'Nairobi, Kenya',
        check_in_time: '14:00:00',
        check_out_time: '10:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'd7f2c9a4-8e31-4b7a-9f2e-222222222222',
        slug: 'mums-garden-resort',
        name: "Mum's Garden Resort",
        timezone: 'Africa/Nairobi',
        currency: 'KES',
        contact_email: 'info@mumsgardenresort.co.ke',
        contact_phone: '+254700000002',
        address: 'Kiambu Road, Nairobi',
        check_in_time: '14:00:00',
        check_out_time: '10:00:00',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('properties', null, {})
  }
}