'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('cancellation_policies', [
      {
        id: 'c9999999-0000-0000-0000-000000000001',
        property_id: 'b3ac1eab-5b2d-4e2a-9c1a-111111111111', // Centurion
        name: 'Standard',
        tiers: JSON.stringify([
          { days_before: 15, refund_pct: 100 },
          { days_before: 14, refund_pct: 50 },
          { hours_before: 48, refund_pct: 0 }
        ]),
        deposit_pct: 30,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'c9999999-0000-0000-0000-000000000002',
        property_id: 'd7f2c9a4-8e31-4b7a-9f2e-222222222222', // Mum's Garden
        name: 'Standard',
        tiers: JSON.stringify([
          { days_before: 15, refund_pct: 100 },
          { days_before: 14, refund_pct: 50 },
          { hours_before: 48, refund_pct: 0 }
        ]),
        deposit_pct: 30,
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('cancellation_policies', null, {})
  }
}