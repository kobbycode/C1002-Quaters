import { SiteConfig, Booking } from '../types';

/**
 * Email template generator for automated guest communications
 */

interface TemplateVariables {
    guestName: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    roomName: string;
    totalPrice: string;
    bookingRef: string;
    supportEmail: string;
    supportPhone: string;
    nights: number;
    checkInTime?: string;
    checkOutTime?: string;
    wifiPassword?: string;
    accessCode?: string;
}

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Replace template variables with actual values
 */
const replaceVariables = (template: string, vars: TemplateVariables): string => {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(regex, String(value));
    });
    return result;
};

/**
 * Base HTML template with brand styling
 */
const getBaseTemplate = (content: string, config: SiteConfig): string => {
    const primaryColor = config.brand.primaryColor || '#8B0000';
    const accentColor = config.brand.accentColor || '#C5A059';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${config.brand.name}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, #2d0a0a 100%); padding: 40px 20px; text-align: center; }
    .logo { color: ${accentColor}; font-size: 32px; font-weight: bold; font-style: italic; margin: 0; }
    .tagline { color: #ffffff; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px; opacity: 0.8; }
    .content { padding: 40px 30px; color: #333333; line-height: 1.8; }
    .content h1 { color: ${primaryColor}; font-size: 28px; margin-bottom: 20px; }
    .content h2 { color: ${accentColor}; font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
    .booking-details { background-color: #f9f9f9; border-left: 4px solid ${accentColor}; padding: 20px; margin: 25px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eeeeee; }
    .detail-label { font-weight: bold; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-value { color: #333333; font-weight: bold; }
    .cta-button { display: inline-block; background-color: ${accentColor}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; }
    .footer { background-color: #2a2a2a; color: #ffffff; padding: 30px 20px; text-align: center; font-size: 12px; }
    .footer a { color: ${accentColor}; text-decoration: none; }
    .divider { height: 2px; background: linear-gradient(to right, transparent, ${accentColor}, transparent); margin: 30px 0; }
    @media only screen and (max-width: 600px) {
      .content { padding: 20px 15px; }
      .detail-row { flex-direction: column; }
      .detail-value { margin-top: 5px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">${config.brand.name}</h1>
      <p class="tagline">${config.brand.tagline}</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${config.brand.name}</strong></p>
      <p>${config.footer.address}</p>
      <p>
        <a href="mailto:${config.footer.email}">${config.footer.email}</a> | 
        <a href="tel:${config.footer.phone}">${config.footer.phone}</a>
      </p>
      <p style="margin-top: 20px; opacity: 0.7;">
        You're receiving this email because you made a booking with us.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Booking Confirmation Email
 */
export const generateBookingConfirmation = (booking: Booking, config: SiteConfig): { html: string; text: string; subject: string } => {
    const vars: TemplateVariables = {
        guestName: booking.guestName,
        propertyName: config.brand.name,
        checkIn: formatDate(booking.isoCheckIn),
        checkOut: formatDate(booking.isoCheckOut),
        roomName: booking.roomName,
        totalPrice: formatCurrency(booking.totalPrice, config.currency),
        bookingRef: booking.id.substring(0, 8).toUpperCase(),
        supportEmail: config.footer.email,
        supportPhone: config.footer.phone,
        nights: booking.nights
    };

    const content = `
    <h1>🎉 Your Reservation is Confirmed!</h1>
    <p>Dear ${vars.guestName},</p>
    <p>Thank you for choosing ${vars.propertyName}! We're thrilled to confirm your upcoming stay with us.</p>
    
    <div class="booking-details">
      <h2 style="margin-top: 0; color: ${config.brand.accentColor};">Booking Details</h2>
      <div class="detail-row">
        <span class="detail-label">Booking Reference</span>
        <span class="detail-value">${vars.bookingRef}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Accommodation</span>
        <span class="detail-value">${vars.roomName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-In</span>
        <span class="detail-value">${vars.checkIn}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-Out</span>
        <span class="detail-value">${vars.checkOut}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nights</span>
        <span class="detail-value">${vars.nights} Night${vars.nights > 1 ? 's' : ''}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Total Amount</span>
        <span class="detail-value" style="font-size: 18px; color: ${config.brand.accentColor};">${vars.totalPrice}</span>
      </div>
    </div>

    <h2>What's Next?</h2>
    <p>You'll receive check-in instructions 2 days before your arrival. In the meantime, if you have any questions or special requests, please don't hesitate to reach out.</p>

    <div class="divider"></div>

    <p style="text-align: center;">
      <a href="mailto:${vars.supportEmail}" class="cta-button">Contact Us</a>
    </p>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Cancellation Policy:</strong> Please contact us at least 48 hours before your check-in date for cancellations or modifications.
    </p>

    <p style="margin-top: 30px;">We look forward to welcoming you!</p>
    <p><strong>The ${vars.propertyName} Team</strong></p>
  `;

    const text = `
BOOKING CONFIRMATION - ${vars.propertyName}

Dear ${vars.guestName},

Your reservation is confirmed!

BOOKING DETAILS:
Reference: ${vars.bookingRef}
Accommodation: ${vars.roomName}
Check-In: ${vars.checkIn}
Check-Out: ${vars.checkOut}
Nights: ${vars.nights}
Total: ${vars.totalPrice}

You'll receive check-in instructions 2 days before your arrival.

Questions? Contact us:
Email: ${vars.supportEmail}
Phone: ${vars.supportPhone}

We look forward to welcoming you!

The ${vars.propertyName} Team
  `.trim();

    return {
        html: getBaseTemplate(content, config),
        text,
        subject: `Your Reservation at ${vars.propertyName} is Confirmed! 🎉`
    };
};

/**
 * Pre-Arrival Reminder Email
 */
export const generatePreArrivalReminder = (booking: Booking, config: SiteConfig): { html: string; text: string; subject: string } => {
    const vars: TemplateVariables = {
        guestName: booking.guestName,
        propertyName: config.brand.name,
        checkIn: formatDate(booking.isoCheckIn),
        checkOut: formatDate(booking.isoCheckOut),
        roomName: booking.roomName,
        totalPrice: formatCurrency(booking.totalPrice, config.currency),
        bookingRef: booking.id.substring(0, 8).toUpperCase(),
        supportEmail: config.footer.email,
        supportPhone: config.footer.phone,
        nights: booking.nights,
        checkInTime: '2:00 PM',
        wifiPassword: 'Available at check-in'
    };

    const content = `
    <h1>✨ Your Stay is Just 2 Days Away!</h1>
    <p>Dear ${vars.guestName},</p>
    <p>We're excited to welcome you to ${vars.propertyName} in just 2 days! Here's everything you need to know for a smooth arrival.</p>
    
    <div class="booking-details">
      <h2 style="margin-top: 0; color: ${config.brand.accentColor};">Your Reservation</h2>
      <div class="detail-row">
        <span class="detail-label">Booking Reference</span>
        <span class="detail-value">${vars.bookingRef}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Accommodation</span>
        <span class="detail-value">${vars.roomName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-In</span>
        <span class="detail-value">${vars.checkIn} at ${vars.checkInTime}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Check-Out</span>
        <span class="detail-value">${vars.checkOut} at 11:00 AM</span>
      </div>
    </div>

    <h2>📍 Getting Here</h2>
    <p><strong>Address:</strong> ${config.footer.address}</p>
    <p>Parking is available on-site for guests.</p>

    <h2>🔑 Check-In Process</h2>
    <p>Check-in time is from ${vars.checkInTime}. Please proceed to the reception desk where our team will be ready to welcome you.</p>

    <h2>📦 What to Bring</h2>
    <ul style="line-height: 2;">
      <li>Valid photo ID</li>
      <li>Booking confirmation (this email)</li>
      <li>Payment card for incidentals</li>
    </ul>

    <div class="divider"></div>

    <p style="text-align: center;">
      <a href="tel:${vars.supportPhone}" class="cta-button">Call Us</a>
    </p>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      <strong>Need to make changes?</strong> Contact us at ${vars.supportEmail} or ${vars.supportPhone}
    </p>

    <p style="margin-top: 30px;">See you soon!</p>
    <p><strong>The ${vars.propertyName} Team</strong></p>
  `;

    const text = `
YOUR STAY IS JUST 2 DAYS AWAY! - ${vars.propertyName}

Dear ${vars.guestName},

We're excited to welcome you in 2 days!

YOUR RESERVATION:
Reference: ${vars.bookingRef}
Accommodation: ${vars.roomName}
Check-In: ${vars.checkIn} at ${vars.checkInTime}
Check-Out: ${vars.checkOut} at 11:00 AM

GETTING HERE:
${config.footer.address}
Parking available on-site

WHAT TO BRING:
- Valid photo ID
- Booking confirmation
- Payment card for incidentals

Questions? Contact us:
Email: ${vars.supportEmail}
Phone: ${vars.supportPhone}

See you soon!
The ${vars.propertyName} Team
  `.trim();

    return {
        html: getBaseTemplate(content, config),
        text,
        subject: `Your Stay at ${vars.propertyName} is Just 2 Days Away! ✨`
    };
};

/**
 * Review Request Email
 */
export const generateReviewRequest = (booking: Booking, config: SiteConfig): { html: string; text: string; subject: string } => {
    const vars: TemplateVariables = {
        guestName: booking.guestName,
        propertyName: config.brand.name,
        checkIn: formatDate(booking.isoCheckIn),
        checkOut: formatDate(booking.isoCheckOut),
        roomName: booking.roomName,
        totalPrice: formatCurrency(booking.totalPrice, config.currency),
        bookingRef: booking.id.substring(0, 8).toUpperCase(),
        supportEmail: config.footer.email,
        supportPhone: config.footer.phone,
        nights: booking.nights
    };

    const reviewUrl = `${window.location.origin}/rooms/${booking.roomId}#reviews`;

    const content = `
    <h1>💭 How Was Your Stay?</h1>
    <p>Dear ${vars.guestName},</p>
    <p>Thank you for choosing ${vars.propertyName} for your recent stay. We hope you had a wonderful experience!</p>
    
    <p>Your feedback is incredibly valuable to us and helps us continue to provide exceptional hospitality. Would you take a moment to share your thoughts?</p>

    <div class="booking-details">
      <div class="detail-row">
        <span class="detail-label">Your Stay</span>
        <span class="detail-value">${vars.roomName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Dates</span>
        <span class="detail-value">${formatDate(booking.isoCheckIn).split(',')[0]} - ${formatDate(booking.isoCheckOut).split(',')[0]}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Reference</span>
        <span class="detail-value">${vars.bookingRef}</span>
      </div>
    </div>

    <p style="text-align: center; margin: 40px 0;">
      <a href="${reviewUrl}" class="cta-button">Leave a Review</a>
    </p>

    <div style="background-color: #f9f9f9; border: 2px dashed ${config.brand.accentColor}; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <p style="margin: 0; font-size: 16px; color: ${config.brand.primaryColor};"><strong>🎁 Special Thank You</strong></p>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Leave a review and receive <strong>10% off</strong> your next booking!</p>
    </div>

    <p>We'd love to hear about:</p>
    <ul style="line-height: 2;">
      <li>Your overall experience</li>
      <li>The comfort and cleanliness of your accommodation</li>
      <li>Our team's hospitality</li>
      <li>Any suggestions for improvement</li>
    </ul>

    <div class="divider"></div>

    <p style="margin-top: 30px;">Thank you for being our valued guest. We hope to welcome you back soon!</p>
    <p><strong>The ${vars.propertyName} Team</strong></p>
  `;

    const text = `
HOW WAS YOUR STAY? - ${vars.propertyName}

Dear ${vars.guestName},

Thank you for staying with us! We hope you had a wonderful experience.

YOUR STAY:
Accommodation: ${vars.roomName}
Dates: ${formatDate(booking.isoCheckIn).split(',')[0]} - ${formatDate(booking.isoCheckOut).split(',')[0]}
Reference: ${vars.bookingRef}

We'd love to hear your feedback! Leave a review and receive 10% off your next booking.

Leave a review: ${reviewUrl}

Thank you for being our valued guest!

The ${vars.propertyName} Team

Contact us: ${vars.supportEmail} | ${vars.supportPhone}
  `.trim();

    return {
        html: getBaseTemplate(content, config),
        text,
        subject: `How Was Your Stay at ${vars.propertyName}? 💭`
    };
};

/**
 * Payment Receipt Email
 */
export const generatePaymentReceipt = (booking: Booking, config: SiteConfig): { html: string; text: string; subject: string } => {
    const vars: TemplateVariables = {
        guestName: booking.guestName,
        propertyName: config.brand.name,
        checkIn: formatDate(booking.isoCheckIn),
        checkOut: formatDate(booking.isoCheckOut),
        roomName: booking.roomName,
        totalPrice: formatCurrency(booking.totalPrice, config.currency),
        bookingRef: booking.id.substring(0, 8).toUpperCase(),
        supportEmail: config.footer.email,
        supportPhone: config.footer.phone,
        nights: booking.nights
    };

    const receiptDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const content = `
    <h1>✅ Payment Receipt</h1>
    <p>Dear ${vars.guestName},</p>
    <p>Thank you for your payment. This email serves as your official receipt for your booking at ${vars.propertyName}.</p>
    
    <div class="booking-details">
      <h2 style="margin-top: 0; color: ${config.brand.accentColor};">Receipt Details</h2>
      <div class="detail-row">
        <span class="detail-label">Receipt Date</span>
        <span class="detail-value">${receiptDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Booking Reference</span>
        <span class="detail-value">${vars.bookingRef}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">${booking.paymentMethod === 'paystack' ? 'Card Payment' : 'Cash'}</span>
      </div>
      ${booking.paymentReference ? `
      <div class="detail-row">
        <span class="detail-label">Transaction ID</span>
        <span class="detail-value">${booking.paymentReference}</span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Accommodation</span>
        <span class="detail-value">${vars.roomName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-In</span>
        <span class="detail-value">${vars.checkIn}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-Out</span>
        <span class="detail-value">${vars.checkOut}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nights</span>
        <span class="detail-value">${vars.nights}</span>
      </div>
      <div class="detail-row" style="border-bottom: none; margin-top: 15px; padding-top: 15px; border-top: 2px solid ${config.brand.accentColor};">
        <span class="detail-label" style="font-size: 14px;">Total Paid</span>
        <span class="detail-value" style="font-size: 24px; color: ${config.brand.accentColor};">${vars.totalPrice}</span>
      </div>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Please keep this receipt for your records. If you have any questions about this payment, please contact us.
    </p>

    <div class="divider"></div>

    <p style="text-align: center;">
      <a href="mailto:${vars.supportEmail}" class="cta-button">Contact Support</a>
    </p>

    <p style="margin-top: 30px;">Thank you for your business!</p>
    <p><strong>The ${vars.propertyName} Team</strong></p>
  `;

    const text = `
PAYMENT RECEIPT - ${vars.propertyName}

Dear ${vars.guestName},

Thank you for your payment. This is your official receipt.

RECEIPT DETAILS:
Receipt Date: ${receiptDate}
Booking Reference: ${vars.bookingRef}
Payment Method: ${booking.paymentMethod === 'paystack' ? 'Card Payment' : 'Cash'}
${booking.paymentReference ? `Transaction ID: ${booking.paymentReference}` : ''}

BOOKING DETAILS:
Accommodation: ${vars.roomName}
Check-In: ${vars.checkIn}
Check-Out: ${vars.checkOut}
Nights: ${vars.nights}

TOTAL PAID: ${vars.totalPrice}

Please keep this receipt for your records.

Questions? Contact us:
Email: ${vars.supportEmail}
Phone: ${vars.supportPhone}

Thank you for your business!
The ${vars.propertyName} Team
  `.trim();

    return {
        html: getBaseTemplate(content, config),
        text,
        subject: `Payment Receipt - ${vars.propertyName} (${vars.bookingRef})`
    };
};
