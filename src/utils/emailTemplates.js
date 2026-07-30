const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// ---- shared design tokens ----------------------------------------------
const COLORS = {
  bg: '#f4f5f7',
  card: '#ffffff',
  border: '#e6e8eb',
  text: '#1f2937',
  muted: '#6b7280',
  heading: '#0f172a',
  accent: '#111827', // near-black accent, used for the top bar / labels
  footer: '#9ca3af',
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

// Renders a single row inside the details table
const detailRow = (label, value, isLast = false) => `
  <tr>
    <td style="padding:10px 0; border-bottom:${isLast ? 'none' : `1px solid ${COLORS.border}`}; font-size:13px; color:${COLORS.muted}; width:44%;">
      ${label}
    </td>
    <td style="padding:10px 0; border-bottom:${isLast ? 'none' : `1px solid ${COLORS.border}`}; font-size:14px; color:${COLORS.text}; text-align:right; font-weight:600;">
      ${value}
    </td>
  </tr>
`

// status accent bar colors per email type
const STATUS = {
  confirmed: { label: 'Confirmed', color: '#16a34a' },
  cancelled: { label: 'Cancelled', color: '#dc2626' },
  expired: { label: 'Hold Expired', color: '#d97706' },
  checkedIn: { label: 'Checked In', color: '#2563eb' },
  checkedOut: { label: 'Checked Out', color: '#4b5563' },
}

// Base wrapper: full HTML email shell built with tables for client compatibility
const wrap = ({ propertyName, statusKey, title, bodyHtml, bookingCode }) => {
  const status = STATUS[statusKey]
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:${COLORS.card}; border-radius:12px; overflow:hidden; border:1px solid ${COLORS.border};">

            <!-- accent bar -->
            <tr>
              <td style="height:4px; background-color:${status.color}; font-size:0; line-height:0;">&nbsp;</td>
            </tr>

            <!-- header -->
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:${COLORS.muted};">
                      ${propertyName}
                    </td>
                    <td align="right">
                      <span style="display:inline-block; padding:4px 10px; border-radius:20px; background-color:${status.color}1a; color:${status.color}; font-size:11px; font-weight:700; letter-spacing:0.03em; text-transform:uppercase;">
                        ${status.label}
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:16px 0 4px 0; font-size:20px; color:${COLORS.heading}; font-weight:700;">
                  ${title}
                </h1>
                ${bookingCode ? `<p style="margin:0 0 8px 0; font-size:13px; color:${COLORS.muted};">Booking ${bookingCode}</p>` : ''}
              </td>
            </tr>

            <!-- body -->
            <tr>
              <td style="padding:8px 32px 32px 32px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td style="padding:20px 32px; border-top:1px solid ${COLORS.border}; text-align:center;">
                <p style="margin:0; font-size:12px; color:${COLORS.footer};">
                  This is an automated message about your booking at ${propertyName}.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

// ---- templates ----------------------------------------------------------

const bookingConfirmed = (booking, property) => ({
  subject: `Booking Confirmed : ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'confirmed',
    title: `Hi ${booking.guest_first_name}, you're all set`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 16px 0; font-size:14px; color:${COLORS.text};">
        Your booking is confirmed. Here are your details:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        ${detailRow('Check-in', fmtDate(booking.check_in_date))}
        ${detailRow('Check-out', fmtDate(booking.check_out_date))}
        ${detailRow('Amount paid', `${booking.amount_paid} ${booking.currency || 'KES'}`)}
        ${detailRow('Balance due on arrival', `${booking.balance_due} ${booking.currency || 'KES'}`, true)}
      </table>
      <p style="margin:20px 0 0 0; font-size:14px; color:${COLORS.text};">
        We look forward to welcoming you.
      </p>
    `,
  }),
})

const bookingCancelled = (booking, property) => ({
  subject: `Booking Cancelled : ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'cancelled',
    title: `Hi ${booking.guest_first_name}, your booking was cancelled`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        ${detailRow('Check-in', fmtDate(booking.check_in_date))}
        ${detailRow('Check-out', fmtDate(booking.check_out_date), true)}
      </table>
      <p style="margin:20px 0 0 0; font-size:14px; color:${COLORS.text};">
        If you believe this is a mistake, please contact us directly.
      </p>
    `,
  }),
})

const bookingExpired = (booking, property) => ({
  subject: `Booking Hold Expired : ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'expired',
    title: `Hi ${booking.guest_first_name}, your hold has expired`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0; font-size:14px; color:${COLORS.text};">
        Your booking hold expired before payment was completed, so the room has been released.
        You're welcome to make a new booking any time.
      </p>
    `,
  }),
})

const bookingCheckedIn = (booking, property) => ({
  subject: `Welcome : Checked In (${booking.booking_code})`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'checkedIn',
    title: `Welcome, ${booking.guest_first_name}`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0; font-size:14px; color:${COLORS.text};">
        You've been checked in. We hope you enjoy your stay!
      </p>
    `,
  }),
})

const bookingCheckedOut = (booking, property) => ({
  subject: `Thank You for Staying With Us (${booking.booking_code})`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'checkedOut',
    title: `Thank you, ${booking.guest_first_name}`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0; font-size:14px; color:${COLORS.text};">
        Thanks for staying with us — you've been checked out. We hope to see you again soon.
      </p>
    `,
  }),
})

module.exports = {
  bookingConfirmed,
  bookingCancelled,
  bookingExpired,
  bookingCheckedIn,
  bookingCheckedOut,
}