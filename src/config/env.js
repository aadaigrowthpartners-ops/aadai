// ============================================
// Environment Configuration
// ============================================
// Single source of truth for all environment variables.
// In Vite, these are loaded from import.meta.env
// ============================================

export const ENV = {
  // EmailJS
  EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  EMAILJS_OTP_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID,
  EMAILJS_LEAD_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_LEAD_TEMPLATE_ID,

  // Razorpay
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,

  // Razorpay App Info (Hardcoded, not secret)
  RAZORPAY_BUSINESS_NAME: 'Aadai Growth Partners',
  RAZORPAY_DESCRIPTION: 'Direct Buyer Pipeline — 12 Months Access',
  RAZORPAY_THEME_COLOR: '#F5A623'
}

// ────────────────────────────────────────────
// Validation on Startup
// ────────────────────────────────────────────
const requiredVars = [
  { key: 'VITE_EMAILJS_PUBLIC_KEY', value: ENV.EMAILJS_PUBLIC_KEY },
  { key: 'VITE_EMAILJS_SERVICE_ID', value: ENV.EMAILJS_SERVICE_ID },
  { key: 'VITE_EMAILJS_OTP_TEMPLATE_ID', value: ENV.EMAILJS_OTP_TEMPLATE_ID },
  { key: 'VITE_RAZORPAY_KEY_ID', value: ENV.RAZORPAY_KEY_ID }
]

const missingVars = requiredVars.filter(v => !v.value || v.value.trim() === '')

if (missingVars.length > 0) {
  const missingKeys = missingVars.map(v => v.key).join(', ')
  console.error(`[CONFIG ERROR] Missing required environment variables: ${missingKeys}`)
  console.error('Please check your .env file or Netlify Environment Variables.')
}

// Note regarding Razorpay Secret Key:
// DO NOT add or reference the Razorpay Secret Key anywhere in this frontend codebase.
// The Secret Key must ONLY exist on a secure backend server.

// Note regarding OTP Flow:
// The current OTP flow generates and verifies the OTP purely on the frontend.
// In a future production upgrade, this logic should be moved to a secure backend server.
