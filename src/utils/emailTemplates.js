const fmtDate = d =>
  new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })


const COLORS = {
  bg: '#f6f9fc',
  card: '#ffffff',
  border: '#e9edf2',
  text: '#1a1a2e',
  muted: '#6b7280',
  heading: '#0f172a',
  accent: '#1a1a2e',
  footer: '#94a3b8',
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  info: '#2563eb'
}

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

// Renders a single row inside the details table
const detailRow = (label, value, isLast = false) => `
  <tr>
    <td style="padding:12px 0; border-bottom:${
      isLast ? 'none' : `1px solid ${COLORS.border}`
    }; font-size:14px; color:${COLORS.muted}; width:45%;">
      ${label}
    </td>
    <td style="padding:12px 0; border-bottom:${
      isLast ? 'none' : `1px solid ${COLORS.border}`
    }; font-size:15px; color:${
  COLORS.text
}; text-align:right; font-weight:600;">
      ${value}
    </td>
  </tr>
`

// status accent bar colors per email type
const STATUS = {
  confirmed: { label: 'Confirmed', color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
  expired: { label: 'Hold Expired', color: '#d97706', bg: '#fffbeb' },
  checkedIn: { label: 'Checked In', color: '#2563eb', bg: '#eff6ff' },
  checkedOut: { label: 'Checked Out', color: '#4b5563', bg: '#f3f4f6' },
  staffInvite: { label: 'Invitation', color: '#7c3aed', bg: '#f5f3ff' }
}

// Base wrapper: full HTML email shell
const wrap = ({ propertyName, statusKey, title, bodyHtml, bookingCode }) => {
  const status = STATUS[statusKey] || STATUS.checkedOut
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family:${FONT}; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg}; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:${COLORS.card}; border-radius:16px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);">
          
          <!-- Decorative header bar -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px; background:${status.color}; border-radius:4px; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:13px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; color:${COLORS.muted};">
                      ${propertyName}
                    </span>
                    ${bookingCode ? `<span style="margin:0 8px; color:${COLORS.border};">·</span>` : ''}
                    ${bookingCode ? `<span style="font-size:13px; color:${COLORS.muted};">${bookingCode}</span>` : ''}
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:4px 14px; border-radius:20px; background:${status.bg}; color:${status.color}; font-size:12px; font-weight:700; letter-spacing:0.03em; text-transform:uppercase;">
                      ${status.label}
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:16px 0 4px 0; font-size:22px; color:${COLORS.heading}; font-weight:700; line-height:1.3;">
                ${title}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:16px 40px 32px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px; border-top:1px solid ${COLORS.border}; background:${COLORS.bg}; border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0; font-size:13px; color:${COLORS.footer}; line-height:1.6;">
                      ${propertyName} · This is an automated message
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Tiny footer note -->
        <p style="margin:24px 0 0 0; font-size:12px; color:${COLORS.footer};">
          © ${new Date().getFullYear()} ${propertyName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// ---- templates ----------------------------------------------------------

const bookingConfirmed = (booking, property) => ({
  subject: `Booking Confirmed · ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'confirmed',
    title: `You're all set, ${booking.guest_first_name}!`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 20px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        Your booking has been confirmed. Here's a summary of your stay:
      </p>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg}; border-radius:8px; padding:4px 16px; margin-bottom:8px;">
        ${detailRow('Check-in', fmtDate(booking.check_in_date))}
        ${detailRow('Check-out', fmtDate(booking.check_out_date))}
        ${detailRow('Amount paid', `${booking.amount_paid} ${booking.currency || 'KES'}`)}
        ${detailRow('Balance due', `${booking.balance_due} ${booking.currency || 'KES'}`, true)}
      </table>
      
      <div style="margin:24px 0 0 0; padding:16px 20px; background:${COLORS.primaryLight}; border-radius:8px; border-left:4px solid ${COLORS.primary};">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.6;">
          <strong>We look forward to welcoming you!</strong><br>
          If you need anything, don't hesitate to reach out.
        </p>
      </div>
    `
  })
})

const bookingCancelled = (booking, property) => ({
  subject: `Booking Cancelled · ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'cancelled',
    title: `Booking cancelled, ${booking.guest_first_name}`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 16px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        Your booking has been cancelled. Here are the details:
      </p>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg}; border-radius:8px; padding:4px 16px; margin-bottom:8px;">
        ${detailRow('Check-in', fmtDate(booking.check_in_date))}
        ${detailRow('Check-out', fmtDate(booking.check_out_date), true)}
      </table>
      
      <div style="margin:24px 0 0 0; padding:16px 20px; background:#fef2f2; border-radius:8px; border-left:4px solid ${COLORS.danger};">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.6;">
          <strong>Need help?</strong><br>
          If this cancellation was made in error, please contact us immediately.
        </p>
      </div>
    `
  })
})

const bookingExpired = (booking, property) => ({
  subject: `Booking Hold Expired · ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'expired',
    title: `Your hold has expired, ${booking.guest_first_name}`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 16px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        Your booking hold expired because payment wasn't completed in time. The room has been released.
      </p>
      
      <div style="margin:24px 0 0 0; padding:16px 20px; background:#fffbeb; border-radius:8px; border-left:4px solid ${COLORS.warning};">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.6;">
          <strong>Still interested?</strong><br>
          You're welcome to make a new booking — we'd love to have you!
        </p>
      </div>
    `
  })
})

const bookingCheckedIn = (booking, property) => ({
  subject: `Welcome! Checked In · ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'checkedIn',
    title: `Welcome, ${booking.guest_first_name}!`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 16px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        You've been checked in. We hope you have a wonderful stay!
      </p>
      
      <div style="margin:24px 0 0 0; padding:16px 20px; background:#eff6ff; border-radius:8px; border-left:4px solid ${COLORS.info};">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.6;">
          <strong> Enjoy your stay!</strong><br>
          If you need anything, our team is here to help.
        </p>
      </div>
    `
  })
})

const bookingCheckedOut = (booking, property) => ({
  subject: `Thank You! Checked Out · ${booking.booking_code}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'checkedOut',
    title: `Thank you, ${booking.guest_first_name}!`,
    bookingCode: booking.booking_code,
    bodyHtml: `
      <p style="margin:0 0 16px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        Thanks for staying with us — you've been checked out. We hope to see you again soon!
      </p>
      
      <div style="margin:24px 0 0 0; padding:16px 20px; background:#f3f4f6; border-radius:8px; border-left:4px solid ${COLORS.muted};">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.6;">
          <strong> We'd love your feedback!</strong><br>
          Your experience matters to us. Please consider leaving a review.
        </p>
      </div>
    `
  })
})

const staffInvite = (user, property, link) => ({
  subject: `You're invited to join ${property.name}`,
  html: wrap({
    propertyName: property.name,
    statusKey: 'staffInvite',
    title: `Welcome to ${property.name}`,
    bookingCode: null,
    bodyHtml: `
      <p style="margin:0 0 8px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        Hi ${user.first_name},
      </p>
      <p style="margin:0 0 20px 0; font-size:15px; color:${COLORS.text}; line-height:1.7;">
        You've been added as <strong>${user.role === 'admin' ? 'an admin' : 'a staff member'}</strong> for <strong>${property.name}</strong>.
        Click the button below to set your password and activate your account:
      </p>
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center">
            <a href="${link}" style="display:inline-block; padding:14px 32px; background:${COLORS.primary}; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px; box-shadow:0 2px 4px rgba(37,99,235,0.2);">
              Activate your account →
            </a>
          </td>
        </tr>
      </table>
      
      <div style="padding:16px 20px; background:${COLORS.bg}; border-radius:8px; margin-top:8px;">
        <p style="margin:0; font-size:13px; color:${COLORS.muted}; line-height:1.6;">
          <strong>Or copy this link:</strong><br>
          <span style="word-break:break-all; color:${COLORS.primary};">${link}</span>
        </p>
        <p style="margin:8px 0 0 0; font-size:13px; color:${COLORS.muted};">
         This link expires in ${process.env.INVITE_TOKEN_EXPIRES_HOURS || 48} hours.
        </p>
      </div>
    `
  })
})

module.exports = {
  bookingConfirmed,
  bookingCancelled,
  bookingExpired,
  bookingCheckedIn,
  bookingCheckedOut,
  staffInvite
}
