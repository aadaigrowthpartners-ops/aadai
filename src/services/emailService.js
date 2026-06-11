  // ─────────────────────────────────────────────────────────
  // Email Service
  // All EmailJS calls go through this module.
  // Components never call emailjs.send() directly.
  // ─────────────────────────────────────────────────────────
  import emailjs from '@emailjs/browser'
  import { ENV } from '../config/env'

  /**
   * Send a 6-digit OTP to the customer's email.
   * @param {{ toEmail: string, toName: string, otpCode: string }} params
   */
  export async function sendOtpEmail({ toEmail, toName, otpCode }) {
    // 5. Validate recipient email before sending
    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(toEmail)) {
      throw new Error('Invalid email address provided to EmailJS service.')
    }

    // 3. Log Configuration
    console.log('--- EmailJS Configuration ---')
    console.log('Service ID:', ENV.EMAILJS_SERVICE_ID)
    console.log('OTP Template ID:', ENV.EMAILJS_OTP_TEMPLATE_ID)
    console.log('Public Key:', ENV.EMAILJS_PUBLIC_KEY ? ENV.EMAILJS_PUBLIC_KEY.substring(0, 4) + '****' : 'MISSING')
    
    const templateParams = {
      to_email: toEmail,
      to_name:  toName,
      otp_code: otpCode,
    }

    console.log('--- EmailJS OTP Request Payload ---', templateParams)

    try {
      const response = await emailjs.send(
        ENV.EMAILJS_SERVICE_ID,
        ENV.EMAILJS_OTP_TEMPLATE_ID,
        templateParams,
        ENV.EMAILJS_PUBLIC_KEY
      )
      console.log('--- EmailJS Success ---', response)
      return response
    } catch (error) {
      console.error('--- EmailJS Error ---', error)
      if (error.text) {
        console.error('EmailJS Error Text:', error.text)
      }
      if (error.status) {
        console.error('EmailJS Error Status:', error.status)
      }
      throw error
    }
  }

  /**
   * Send a lead notification to the business inbox.
   * Called on payment success, failure, and abandon.
   *
   * @param {{
   *   customerName:  string,
   *   customerEmail: string,
   *   customerPhone: string,
   *   promoCode:     string,
   *   finalPrice:    number,
   *   paymentStatus: string,
   *   paymentId:     string,
   * }} params
   */
  export async function sendLeadEmail({
    customerName,
    customerEmail,
    customerPhone,
    promoCode,
    finalPrice,
    paymentStatus,
    paymentId = 'N/A',
  }) {
    return emailjs.send(
      ENV.EMAILJS_SERVICE_ID,
      ENV.EMAILJS_LEAD_TEMPLATE_ID,
      {
        customer_name:  customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        promo_code:     promoCode || 'None',
        final_price:    finalPrice,
        payment_status: paymentStatus,
        payment_id:     paymentId,
        timestamp:      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
      ENV.EMAILJS_PUBLIC_KEY
    )
  }
