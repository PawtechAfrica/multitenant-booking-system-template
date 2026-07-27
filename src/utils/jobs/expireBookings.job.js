const cron = require('node-cron')
const { Op } = require('sequelize')
const { Booking } = require('../../database/models')

const startExpireBookingsJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const [count] = await Booking.update(
        { status: 'expired' },
        {
          where: {
            status: 'pending_payment',
            expires_at: { [Op.lt]: new Date() }
          }
        }
      )
      if (count > 0) console.log(`[expireBookings] expired ${count} stale booking(s)`)
    } catch (err) {
      console.error('[expireBookings] job failed:', err)
    }
  })
}

module.exports = { startExpireBookingsJob }