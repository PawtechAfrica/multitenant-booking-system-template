require('dotenv').config

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { sequelize } = require('./database/models')

const resolveProperty = require('./middlewares/resolveProperty')

const authRoutes = require('./routes/auth.routes')
const propertyRoutes = require('./routes/property.routes')
const adminPropertyRoutes = require('./routes/admin/property.routes')

const publicRoomTypeRoutes = require('./routes/roomType.routes')
const adminRoomTypeRoutes = require('./routes/admin/roomType.routes')
const availabilityRoutes = require('./routes/availability.routes')
const bookingRoutes = require('./routes/booking.routes')
const paymentRoutes = require('./routes/payment.routes')
const adminStaffRoutes = require('./routes/admin/staff.routes')
const adminBookingRoutes = require('./routes/admin/booking.routes')
const adminCancellationPolicyRoutes = require('./routes/admin/cancellationPolicy.routes')
const adminRatePlanRoutes = require('./routes/admin/ratePlan.routes')
const offerRoutes = require('./routes/offer.routes')
const adminOfferRoutes = require('./routes/admin/offer.routes')
const eventTypeRoutes = require('./routes/eventType.routes')
const adminEventTypeRoutes = require('./routes/admin/eventType.routes')
const inquiryRoutes = require('./routes/inquiry.routes')
const adminInquiryRoutes = require('./routes/admin/inquiry.routes')
const adminRoomRoutes = require('./routes/admin/room.routes')
const adminPaymentRoutes = require('./routes/admin/payment.routes')
const adminRefundRoutes = require('./routes/admin/refund.routes')
const adminReportRoutes = require('./routes/admin/report.routes')
const adminMediaRoutes = require('./routes/admin/media.routes')
const galleryRoutes = require('./routes/galleryItem.routes')
const adminGalleryRoutes = require('./routes/admin/galleryItem.routes')

const { startExpireBookingsJob } = require('./utils/jobs/expireBookings.job')


const errorHandler = require('./middlewares/errorHandler')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Booking Backend API'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Booking Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/properties', propertyRoutes)
app.use('/api/v1/admin/property', adminPropertyRoutes)
app.use(
  '/api/v1/properties/:propertySlug/room-types',
  resolveProperty,
  publicRoomTypeRoutes
)
app.use('/api/v1/admin/room-types', adminRoomTypeRoutes)
app.use(
  '/api/v1/properties/:propertySlug/availability',
  resolveProperty,
  availabilityRoutes
)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin/staff', adminStaffRoutes)
app.use('/api/v1/admin/bookings', adminBookingRoutes)
app.use('/api/v1/admin/cancellation-policies', adminCancellationPolicyRoutes)
app.use('/api/v1/admin/rate-plans', adminRatePlanRoutes)
app.use('/api/v1/properties/:propertySlug/offers', resolveProperty, offerRoutes)
app.use('/api/v1/admin/offers', adminOfferRoutes)
app.use('/api/v1/properties/:propertySlug/event-types', resolveProperty, eventTypeRoutes)
app.use('/api/v1/admin/event-types', adminEventTypeRoutes)
app.use('/api/v1/inquiries', inquiryRoutes)
app.use('/api/v1/admin/inquiries', adminInquiryRoutes)
app.use('/api/v1/admin/rooms', adminRoomRoutes)
app.use('/api/v1/admin/payments', adminPaymentRoutes)
app.use('/api/v1/admin/refunds', adminRefundRoutes)
app.use('/api/v1/admin/reports', adminReportRoutes)
app.use('/api/v1/admin/media', adminMediaRoutes)
app.use('/api/v1/properties/:propertySlug/gallery', resolveProperty, galleryRoutes)
app.use('/api/v1/admin/gallery', adminGalleryRoutes)


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

app.use(errorHandler)

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log(
      'SUCCESSFUL CONNECTION: Database connection established successfully.'
    )

    const syncOptions =
      process.env.NODE_ENV === 'development' ? { alter: process.env.SYNC || false } : {}

    await sequelize.sync(syncOptions)
    console.log('SUCCESSFUL SYNC: Database synchronized successfully.')

    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`)
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(` Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error(' Failed to start server:', error)
    process.exit(1)
  }
}

// graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  await sequelize.close()
  console.log('Database connection closed')
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server')
  await sequelize.close()
  console.log('Database connection closed')
  process.exit(0)
})

startServer()
startExpireBookingsJob()

// module.exports = app
