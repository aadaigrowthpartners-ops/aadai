// ─────────────────────────────────────────────────────────
// Payment Service
// All Razorpay interaction goes through this module.
// Components never reference Razorpay keys directly.
// ─────────────────────────────────────────────────────────
import { ENV } from '../config/env'

/**
 * Dynamically load the Razorpay checkout script (only once).
 * @returns {Promise<void>}
 */
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = resolve
    script.onerror = () => reject(new Error('Razorpay script failed to load'))
    document.body.appendChild(script)
  })
}

/**
 * Open the Razorpay payment modal.
 *
 * @param {{
 *   amountInRupees: number,
 *   name:           string,
 *   email:          string,
 *   phone:          string,
 *   onSuccess:      (paymentId: string) => void,
 *   onDismiss:      () => void,
 *   onError:        (err: Error) => void,
 * }} options
 */
export async function openPaymentModal({
  amountInRupees,
  name,
  email,
  phone,
  onSuccess,
  onDismiss,
  onError,
}) {
  try {
    await loadRazorpayScript()

    const rzp = new window.Razorpay({
      key:         ENV.RAZORPAY_KEY_ID,
      amount:      amountInRupees * 100,   // paise
      currency:    'INR',
      name:        ENV.RAZORPAY_BUSINESS_NAME,
      description: ENV.RAZORPAY_DESCRIPTION,
      prefill:     { name, email, contact: phone },
      theme:       { color: ENV.RAZORPAY_THEME_COLOR },
      handler: (response) => {
        onSuccess(response.razorpay_payment_id)
      },
      modal: {
        ondismiss: onDismiss,
      },
    })

    rzp.open()
  } catch (err) {
    onError(err)
  }
}
