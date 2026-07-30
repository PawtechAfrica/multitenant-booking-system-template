// const cron = require('node-cron')
// const { Op } = require('sequelize')
// const { Booking } = require('../../database/models')

// const startExpireBookingsJob = () => {
//   cron.schedule('*/1 * * * *', async () => {
//     try {
//       const [count] = await Booking.update(
//         { status: 'expired' },
//         {
//           where: {
//             status: 'pending_payment',
//             expires_at: { [Op.lt]: new Date() }
//           }
//         }
//       )
//       if (count > 0) console.log(`[expireBookings] expired ${count} stale booking(s)`)
//     } catch (err) {
//       console.error('[expireBookings] job failed:', err)
//     }
//   })
// }

// module.exports = { startExpireBookingsJob }












const cron = require('node-cron')
const { Op } = require('sequelize')
const { Booking } = require('../../database/models')
const { sendBookingStatusEmail } = require('../../services/notification.service')

const startExpireBookingsJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const staleBookings = await Booking.findAll({
        where: { status: 'pending_payment', expires_at: { [Op.lt]: new Date() } }
      })

      for (const booking of staleBookings) {
        booking.status = 'expired'
        await booking.save()
        await sendBookingStatusEmail(booking.id, 'expired')
      }

      if (staleBookings.length > 0) {
        console.log(`[expireBookings] expired ${staleBookings.length} stale booking(s)`)
      }
    } catch (err) {
      console.error('[expireBookings] job failed:', err)
    }
  })
}

module.exports = { startExpireBookingsJob }