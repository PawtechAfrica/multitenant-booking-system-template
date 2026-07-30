const resend = require('../config/resend')
const { getSender } = require('../config/emailSenders')
const { Booking, Property, NotificationLog } = require('../database/models')
const templates = require('../utils/emailTemplates')

const EVENT_MAP = {
  confirmed: {
    template: 'booking_confirmed',
    build: templates.bookingConfirmed
  },
  cancelled: {
    template: 'booking_cancelled',
    build: templates.bookingCancelled
  },
  expired: { template: 'booking_expired', build: templates.bookingExpired },
  checked_in: {
    template: 'booking_checked_in',
    build: templates.bookingCheckedIn
  },
  checked_out: {
    template: 'booking_checked_out',
    build: templates.bookingCheckedOut
  }
}

const sendBookingStatusEmail = async (bookingId, eventKey) => {
  const config = EVENT_MAP[eventKey]
  if (!config) return // e.g. "no_show" -- not a tracked email event, nothing to do

  let logRow
  try {
    const booking = await Booking.findByPk(bookingId)
    if (!booking) return

    const property = await Property.findByPk(booking.property_id)
    const sender = getSender(property ? property.slug : null)
    const { subject, html } = config.build(
      booking,
      property || { name: 'Your Hotel' }
    )

    logRow = await NotificationLog.create({
      booking_id: booking.id,
      channel: 'email',
      template: config.template,
      status: 'queued',
      payload: { to: booking.guest_email, subject, from: sender.from }
    })

    await resend.emails.send({
      from: `${sender.name} <${sender.from}>`,
      to: booking.guest_email,
      subject,
      html
    })

    logRow.status = 'sent'
    logRow.sent_at = new Date()
    await logRow.save()
  } catch (err) {
    console.error(
      `[notification] failed to send "${eventKey}" email for booking ${bookingId}:`,
      err.message
    )
    if (logRow) {
      logRow.status = 'failed'
      await logRow.save()
    }
  }
}

module.exports = { sendBookingStatusEmail }
