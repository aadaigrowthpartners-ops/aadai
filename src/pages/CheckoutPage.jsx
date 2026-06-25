import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROMO_CODES, SELLING_PRICE, PROMO_TIMER_MINUTES } from '../config/promoCodes'
import { sendOtpEmail, sendLeadEmail } from '../services/emailService'
import { openPaymentModal } from '../services/paymentService'
import Header from '../components/Header'
import '../styles/checkout.css'

/* ── Helpers ── */
const fmt = (n) => '₹' + n.toLocaleString('en-IN')
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

/* ── Validation rules ── */
const RULES = {
  name:  (v) => {
    if (!v.trim())           return 'Full name is required'
    if (v.trim().length < 3) return 'Name must be at least 3 characters'
    return ''
  },
  email: (v) => {
    if (!v.trim())                               return 'Email address is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email address'
    return ''
  },
  phone: (v) => {
    if (!v.trim())              return 'Mobile number is required'
    if (!/^[6-9]\d{9}$/.test(v)) return 'Enter a valid 10-digit Indian mobile number'
    return ''
  },
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
/* ── Pricing constants ── */
const BASE_PRICE           = 60000
const GST_RATE             = 0.18
const PROMO_DISCOUNTED_BASE = 25000
const GST_ON_FULL          = Math.round(BASE_PRICE * GST_RATE)            // 10,800
const TOTAL_WITH_GST       = BASE_PRICE + GST_ON_FULL                      // 70,800
const GST_ON_PROMO         = Math.round(PROMO_DISCOUNTED_BASE * GST_RATE)  // 4,500
const TOTAL_PROMO_WITH_GST = PROMO_DISCOUNTED_BASE + GST_ON_PROMO          // 29,500

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  /* ── Step 1 state ── */
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  // Per-field errors + touched flags for real-time feedback
  const [fieldErrors,  setFieldErrors]  = useState({ name: '', email: '', phone: '' })
  const [touched,      setTouched]      = useState({ name: false, email: false, phone: false })
  const [globalError,  setGlobalError]  = useState('')
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')
  const [sending,      setSending]      = useState(false)

  /* ── Step 2 state ── */
  const [otp,         setOtp]         = useState(['', '', '', '', '', ''])
  const [sentOtp,     setSentOtp]     = useState('')
  const [otpError,    setOtpError]    = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [resending,   setResending]   = useState(false)
  const otpRefs = useRef([])

  /* ── Step 3 state ── */
  const [promoInput,        setPromoInput]        = useState('')
  const [appliedPromo,      setAppliedPromo]      = useState(null)   // string code or null
  const [promoError,        setPromoError]        = useState('')
  const [promoSecondsLeft,  setPromoSecondsLeft]  = useState(PROMO_TIMER_MINUTES * 60)
  const [finalPrice,        setFinalPrice]        = useState(TOTAL_WITH_GST)    // 70,800
  const [gstAmount,         setGstAmount]         = useState(GST_ON_FULL)       // 10,800
  const [displayBasePrice,  setDisplayBasePrice]  = useState(BASE_PRICE)        // 60,000
  const [paying,            setPaying]            = useState(false)

  /* ── Restore OTP Session on Mount ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('aadai_otp_session')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        // Check 10-minute expiry (10 * 60 * 1000)
        if (Date.now() - data.timestamp < 600000) {
          setName(data.name || '')
          setEmail(data.email || '')
          setPhone(data.phone || '')
          setSentOtp(data.sentOtp || '')
          setStep(data.step || 0)
        } else {
          sessionStorage.removeItem('aadai_otp_session')
        }
      } catch {
        sessionStorage.removeItem('aadai_otp_session')
      }
    }
  }, [])

  /* ── Resend countdown (60 s) ── */
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setInterval(() => setResendTimer(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [resendTimer])

  /* ── Promo countdown ── */
  useEffect(() => {
    if (step !== 2 || !appliedPromo) return
    const t = setInterval(() => setPromoSecondsLeft(p => {
      if (p <= 1) {
        clearInterval(t)
        return 0
      }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [step, appliedPromo])

  useEffect(() => {
    if (promoSecondsLeft === 0 && appliedPromo) {
      // Promo expired — reset all pricing to full GST-inclusive price
      setAppliedPromo(null)
      setPromoInput('')
      setDisplayBasePrice(BASE_PRICE)
      setGstAmount(GST_ON_FULL)
      setFinalPrice(TOTAL_WITH_GST)
      setPromoError('Promo code expired. Please request a new offer code.')
    }
  }, [promoSecondsLeft, appliedPromo])

  const promoMinutes = String(Math.floor(promoSecondsLeft / 60)).padStart(2, '0')
  const promoSecs    = String(promoSecondsLeft % 60).padStart(2, '0')

  /* ── Real-time field validation ── */
  const validateField = useCallback((field, value) => {
    const msg = RULES[field](value)
    setFieldErrors(prev => ({ ...prev, [field]: msg }))
    return msg === ''
  }, [])

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, { name, email, phone }[field])
  }

  /* Derived: button enabled only when all fields pass */
  const formIsValid =
    RULES.name(name)  === '' &&
    RULES.email(email) === '' &&
    RULES.phone(phone) === ''

  /* ── Send OTP ── */
  async function sendOtp() {
    // Mark all touched and validate
    setTouched({ name: true, email: true, phone: true })
    const nameOk  = validateField('name',  name)
    const emailOk = validateField('email', email)
    const phoneOk = validateField('phone', phone)
    if (!nameOk || !emailOk || !phoneOk) return

    setSending(true)
    setGlobalError('')
    
    const code = generateOtp()
    setSentOtp(code)
    
    console.log('Sending OTP...')
    console.log('OTP generated:', code)

    try {
      const response = await sendOtpEmail({ toEmail: email, toName: name, otpCode: code })
      console.log('EmailJS response:', response)
      
      setStep(1)
      setResendTimer(60)
      
      const sessionData = {
        name, email, phone,
        sentOtp: code,
        step: 1,
        timestamp: Date.now()
      }
      sessionStorage.setItem('aadai_otp_session', JSON.stringify(sessionData))

      setOtpSuccessMsg('OTP sent successfully. Please check your email.')
      setOtpError('')
      // Auto-focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
      // Scroll center column into view on mobile (value stack sits above)
      setTimeout(() => {
        document.querySelector('.agp-checkout-center')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('EmailJS error:', error)
      const errorText = error.text || error.message || 'Unknown error occurred.'
      setGlobalError(`EmailJS Error: ${errorText}`)
    } finally {
      setSending(false)
    }
  }

  /* ── OTP handlers ── */
  function handleOtpChange(val, idx) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setOtpError('')
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  function handleOtpKey(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) verifyOtp()
  }

  function handleOtpPaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  function verifyOtp() {
    if (otp.join('') === sentOtp) {
      setOtpError('')
      setOtpSuccessMsg('')
      sessionStorage.removeItem('aadai_otp_session')
      setStep(2)
    } else {
      setOtpError('Incorrect OTP. Please check and try again.')
      setOtpSuccessMsg('')
      otpRefs.current[0]?.focus()
    }
  }

  async function handleResend() {
    setResending(true)
    setOtpError('')
    const code = generateOtp()
    setSentOtp(code)
    setOtp(['', '', '', '', '', ''])
    try {
      await sendOtpEmail({ toEmail: email, toName: name, otpCode: code })
      setResendTimer(60)
      
      const sessionData = {
        name, email, phone,
        sentOtp: code,
        step: 1,
        timestamp: Date.now()
      }
      sessionStorage.setItem('aadai_otp_session', JSON.stringify(sessionData))

      setOtpSuccessMsg('OTP sent successfully. Please check your email.')
      setOtpError('')
      setTimeout(() => otpRefs.current[0]?.focus(), 50)
    } catch (error) {
      console.error('handleResend UI Caught Error:', error)
      const errorText = error.text || error.message || 'Unknown error occurred.'
      setOtpError(`EmailJS Error: ${errorText}`)
    } finally {
      setResending(false)
    }
  }

  /* ── Promo — GST-aware fixed pricing ── */
  function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    // Check against PROMO_CODES imported from config
    const found = PROMO_CODES.find(p => p.active && p.code === code)
    if (found) {
      setAppliedPromo(code)                    // store code string
      setDisplayBasePrice(PROMO_DISCOUNTED_BASE) // 25,000
      setGstAmount(GST_ON_PROMO)                 // 4,500
      setFinalPrice(TOTAL_PROMO_WITH_GST)        // 29,500
      setPromoSecondsLeft(PROMO_TIMER_MINUTES * 60)
      setPromoError('')
    } else {
      // Reset to full price on invalid code
      setDisplayBasePrice(BASE_PRICE)
      setGstAmount(GST_ON_FULL)
      setFinalPrice(TOTAL_WITH_GST)
      setAppliedPromo(null)
      setPromoError('Invalid or expired promo code.')
    }
  }

  /* ── Lead email helper ── */
  const sendLead = useCallback(async (status, paymentId = 'N/A') => {
    try {
      await sendLeadEmail({
        customerName:  name,
        customerEmail: email,
        customerPhone: phone,
        promoCode:     appliedPromo || 'None',  // appliedPromo is now a string code
        finalPrice,
        paymentStatus: status,
        paymentId,
      })
    } catch { /* silently ignore */ }
  }, [name, email, phone, appliedPromo, finalPrice])

  /* ── Razorpay ── */
  async function handlePay() {
    setPaying(true)
    await openPaymentModal({
      amountInRupees: finalPrice,
      name, email, phone,
      onSuccess: async (paymentId) => {
        sessionStorage.removeItem('aadai_otp_session')
        await sendLead('SUCCESS', paymentId)
        navigate('/thank-you', { state: { paymentId, name } })
      },
      onDismiss: async () => {
        setPaying(false)
        await sendLead('ABANDONED')
      },
      onError: async (err) => {
        setPaying(false)
        await sendLead('FAILED — ' + err.message)
        alert('Payment gateway failed to load. Please try again.')
      },
    })
  }

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <Header />

      {/* Injected styles — guaranteed to apply regardless of Tailwind config */}
      <style>{`
        .checkout-grid {
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          margin: 0 auto;
        }
        .checkout-left {
          width: 100%;
          border-bottom: 1px solid #EEEEEE;
          padding: 28px 20px;
          order: 1;
        }
        .checkout-right {
          width: 100%;
          padding: 28px 20px;
          order: 2;
        }
        @media (min-width: 1024px) {
          .checkout-grid {
            flex-direction: row;
            align-items: flex-start;
          }
          .checkout-left {
            width: 42%;
            border-bottom: none;
            border-right: 1px solid #EEEEEE;
            padding: 48px 40px;
            position: sticky;
            top: 72px;
            order: 1;
          }
          .checkout-right {
            width: 58%;
            padding: 48px 48px;
            order: 2;
          }
        }
        .ck-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid #F0F0F0;
          gap: 12px;
        }
        .ck-item-row:last-child {
          border-bottom: none;
        }
        .ck-step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ck-step-connector {
          height: 1px;
          background: #DDDDDD;
          flex: 1;
          max-width: 48px;
          min-width: 12px;
        }
        .ck-form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #DDDDDD;
          border-radius: 8px;
          font-size: 15px;
          color: #1A1A1A;
          background: #FFFFFF;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        }
        .ck-form-input:focus {
          border-color: #1B2B5E;
          box-shadow: 0 0 0 3px rgba(27, 43, 94, 0.08);
        }
        .ck-form-input.error { border-color: #DC2626; }
        .ck-form-input.success { border-color: #22C55E; }
        .ck-form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6B6B6B;
          margin-bottom: 6px;
        }
        .ck-primary-btn {
          width: 100%;
          background: #1B2B5E;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 800;
          padding: 16px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.03em;
          min-height: 54px;
          transition: opacity 0.2s, transform 0.2s;
          font-family: var(--font-display, 'Urbanist', sans-serif);
          box-shadow: 0 4px 16px rgba(27, 43, 94, 0.25);
        }
        .ck-primary-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .ck-primary-btn:disabled { 
          opacity: 0.5; 
          cursor: not-allowed; 
        }
        .ck-otp-input {
          flex: 1;
          min-width: 0;
          max-width: 52px;
          aspect-ratio: 1;
          text-align: center;
          font-size: 22px;
          font-weight: 800;
          border: 2px solid #DDDDDD;
          border-radius: 10px;
          background: #F5F5F5;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: var(--font-display, 'Urbanist', sans-serif);
        }
        .ck-otp-input:focus {
          border-color: #1B2B5E;
          box-shadow: 0 0 0 3px rgba(27, 43, 94, 0.08);
        }
        .ck-otp-input.filled {
          border-color: #1B2B5E;
          background: rgba(27, 43, 94, 0.04);
        }
        .ck-otp-input.error {
          border-color: #DC2626;
        }
        @media (max-width: 400px) {
          .ck-otp-input { 
            max-width: 40px; 
            font-size: 18px; 
          }
        }
        .ck-form-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E8E8E8;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          padding: 32px 28px;
        }
        .ck-field-error {
          font-size: 0.75rem;
          color: #DC2626;
          margin-top: 4px;
        }
        .ck-otp-resend {
          font-size: 0.82rem;
          color: #6B6B6B;
          text-align: center;
          margin-bottom: 1.25rem;
        }
        .ck-otp-resend button {
          background: none;
          border: none;
          color: #1B2B5E;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }
        .ck-otp-resend button:disabled { color: #9CA3AF; text-decoration: none; cursor: not-allowed; }
        .ck-promo-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .ck-promo-input {
          flex: 1;
          background: #FFFFFF;
          border: 1.5px solid #DDDDDD;
          border-radius: 8px;
          color: #1A1A1A;
          font-size: 14px;
          padding: 10px 14px;
          outline: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: border-color 0.2s;
          font-family: var(--font-body, sans-serif);
        }
        .ck-promo-input:focus { border-color: #1B2B5E; }
        .ck-promo-btn {
          background: rgba(27, 43, 94, 0.08);
          border: 1px solid rgba(27, 43, 94, 0.2);
          color: #1B2B5E;
          font-size: 14px;
          font-weight: 700;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          font-family: var(--font-display, sans-serif);
        }
        .ck-promo-btn:hover { background: rgba(27, 43, 94, 0.15); }
        .ck-promo-applied {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(34,197,94,0.06);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #16A34A;
          font-weight: 600;
        }
        .ck-promo-applied button {
          background: none;
          border: none;
          color: #6B6B6B;
          cursor: pointer;
          font-size: 16px;
        }
        .ck-promo-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B6B6B;
          margin-bottom: 12px;
        }
        .ck-promo-timer span {
          color: #DC2626;
          font-weight: 700;
        }
        @keyframes ckPulseUrgent {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        .ck-promo-timer span.urgent {
          animation: ckPulseUrgent 1.5s infinite ease-in-out;
          display: inline-block;
        }
        .ck-order-summary {
          background: #F8F8F8;
          border: 1px solid #EEEEEE;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .ck-order-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #6B6B6B;
          margin-bottom: 8px;
        }
        .ck-order-row.total {
          border-top: 1px solid #DDDDDD;
          margin-top: 10px;
          padding-top: 10px;
          font-size: 16px;
          font-weight: 800;
          color: #1A1A1A;
          margin-bottom: 0;
        }
        .ck-order-row.total span:last-child { color: #1B2B5E; }
        .ck-notification {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }
        .ck-notification-success {
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #16a34a;
        }
        .ck-notification-error {
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          color: #DC2626;
        }
        .ck-step-label-hide {
          display: none;
        }
        @media (min-width: 480px) {
          .ck-step-label-hide {
            display: block;
          }
        }
      `}</style>

      <div className="checkout-grid">

        {/* ===== LEFT COLUMN — VALUE STACK ===== */}
        <div className="checkout-left">

          {/* Eyebrow */}
          <p style={{
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#B8932A', marginBottom: '6px', marginTop: 0
          }}>
            What's Included
          </p>

          {/* Heading */}
          <h3 style={{
            fontSize: '22px', fontWeight: 900,
            color: '#1A1A1A', marginBottom: '24px',
            lineHeight: 1.25, marginTop: 0,
            fontFamily: 'var(--font-display, Urbanist, sans-serif)'
          }}>
            The Founding Batch Package
          </h3>

          {/* Line items */}
          <div style={{ marginBottom: '4px' }}>
            {[
              { label: 'Direct-to-WhatsApp Meta Buyer Flow', value: '₹35,000' },
              { label: 'The AI WhatsApp Buyer-Lock System', value: '₹45,000/mo' },
              { label: 'The Qualified-to-Closed 30-Day Playbook', value: '₹35,000' },
            ].map((item, i) => (
              <div key={i} className="ck-item-row">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    color: '#22C55E', fontWeight: 800,
                    fontSize: '15px', flexShrink: 0, marginTop: '1px'
                  }}>✓</span>
                  <span style={{
                    fontSize: '14px', color: '#1A1A1A', lineHeight: 1.45
                  }}>
                    {item.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '13px', color: '#6B6B6B',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  fontWeight: 600
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Total value strikethrough */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: '16px',
            borderTop: '1px solid #EEEEEE', marginTop: '8px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
              Total Value:
            </span>
            <span style={{
              fontSize: '16px', fontWeight: 800,
              color: '#DC2626', textDecoration: 'line-through'
            }}>
              ₹1,15,000
            </span>
          </div>

          {/* Price highlight card */}
          <div style={{
            background: 'linear-gradient(135deg, #1B2B5E 0%, #2D4494 100%)',
            borderRadius: '12px', padding: '20px 16px',
            textAlign: 'center', marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.7)',
              margin: '0 0 6px', letterSpacing: '0.06em',
              textTransform: 'uppercase', fontWeight: 600
            }}>
              Your Founding Batch Price
            </p>
            <p style={{
              fontSize: '36px', fontWeight: 900,
              color: '#FFFFFF', margin: '0 0 4px', lineHeight: 1,
              fontFamily: 'var(--font-display, Urbanist, sans-serif)'
            }}>
              ₹60,000
            </p>
            <p style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0
            }}>
              + GST · One-time setup fee
            </p>
          </div>

          {/* Scarcity badge */}
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            background: '#FFF8EE', border: '1px solid #F5DFA0',
            borderRadius: '10px', padding: '12px 14px'
          }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <p style={{
              fontSize: '12px', color: '#92400E',
              margin: 0, lineHeight: 1.5
            }}>
              Only <strong>1 factory per garment category</strong> accepted.
              Once your slot is taken, it's gone forever.
            </p>
          </div>

        </div>

        {/* ===== RIGHT COLUMN — FORM STEPS ===== */}
        <div className="checkout-right agp-checkout-center">

          {/* STEP INDICATOR */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            marginBottom: '32px', width: '100%',
            overflow: 'hidden'
          }}>
            {[
              { num: 0, label: 'Your Details' },
              { num: 1, label: 'Verify OTP' },
              { num: 2, label: 'Order Summary' }
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '6px', flexShrink: 0
                }}>
                  <div className="ck-step-circle" style={{
                    background: step > s.num
                      ? '#22C55E'
                      : step === s.num
                        ? '#1B2B5E'
                        : '#E5E7EB',
                    color: step >= s.num ? '#FFFFFF' : '#9CA3AF'
                  }}>
                    {step > s.num ? '✓' : s.num + 1}
                  </div>
                  <span
                    className={step !== s.num ? 'ck-step-label-hide' : ''}
                    style={{
                      fontSize: '12px',
                      fontWeight: step === s.num ? 700 : 400,
                      color: step === s.num ? '#1B2B5E' : '#9CA3AF',
                      whiteSpace: 'nowrap',
                      display: step === s.num ? 'block' : undefined
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="ck-step-connector" />}
              </React.Fragment>
            ))}
          </div>

          {/* ══════════════════ STEP 1 — ENTER DETAILS ══════════════════ */}
          {step === 0 && (
            <div className="ck-form-card">
              <h2 style={{
                fontSize: '24px', fontWeight: 800,
                color: '#1A1A1A', margin: '0 0 8px',
                fontFamily: 'var(--font-display, Urbanist, sans-serif)'
              }}>
                Enter Your Details
              </h2>
              <p style={{
                fontSize: '14px', color: '#6B6B6B',
                margin: '0 0 24px', lineHeight: 1.5
              }}>
                We'll send a 6-digit OTP to your email to verify your identity.
              </p>

              {otpSuccessMsg && (
                <div className="ck-notification ck-notification-success">
                  {otpSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Full Name */}
                <div>
                  <label htmlFor="ch-name" className="ck-form-label">Full Name</label>
                  <input
                    id="ch-name"
                    className={`ck-form-input${touched.name && fieldErrors.name ? ' error' : touched.name && !fieldErrors.name ? ' success' : ''}`}
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => {
                      setName(e.target.value)
                      if (touched.name) validateField('name', e.target.value)
                    }}
                    onBlur={() => handleBlur('name')}
                  />
                  {touched.name && fieldErrors.name && (
                    <div className="ck-field-error">{fieldErrors.name}</div>
                  )}
                </div>

                {/* Work Email */}
                <div>
                  <label htmlFor="ch-email" className="ck-form-label">Work Email</label>
                  <input
                    id="ch-email"
                    className={`ck-form-input${touched.email && fieldErrors.email ? ' error' : touched.email && !fieldErrors.email ? ' success' : ''}`}
                    type="text"
                    placeholder="your@company.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (touched.email) validateField('email', e.target.value)
                    }}
                    onBlur={() => handleBlur('email')}
                  />
                  {touched.email && fieldErrors.email && (
                    <div className="ck-field-error">{fieldErrors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="ch-phone" className="ck-form-label">WhatsApp / Mobile Number</label>
                  <input
                    id="ch-phone"
                    className={`ck-form-input${touched.phone && fieldErrors.phone ? ' error' : touched.phone && !fieldErrors.phone ? ' success' : ''}`}
                    type="text"
                    placeholder="+91 98765 43210"
                    inputMode="numeric"
                    value={phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setPhone(val)
                      if (touched.phone) validateField('phone', val)
                    }}
                    onBlur={() => handleBlur('phone')}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <div className="ck-field-error">{fieldErrors.phone}</div>
                  )}
                </div>
              </div>

              {globalError && (
                <div className="ck-notification ck-notification-error" style={{ marginTop: '16px' }}>
                  {globalError}
                </div>
              )}

              <button
                className="ck-primary-btn"
                style={{ marginTop: '28px' }}
                onClick={sendOtp}
                id="send-otp-btn"
                disabled={sending || !formIsValid}
              >
                {sending ? 'Sending OTP…' : 'Send OTP →'}
              </button>

              {!formIsValid && (
                <p style={{ fontSize: '0.75rem', color: '#6B6B6B', textAlign: 'center', marginTop: '0.6rem' }}>
                  Fill all fields correctly to continue
                </p>
              )}
            </div>
          )}

          {/* ══════════════════ STEP 2 — VERIFY OTP ══════════════════ */}
          {step === 1 && (
            <div className="ck-form-card">
              <h2 style={{
                fontSize: '24px', fontWeight: 800,
                color: '#1A1A1A', margin: '0 0 8px',
                fontFamily: 'var(--font-display, Urbanist, sans-serif)'
              }}>
                Verify Your Email
              </h2>

              {otpSuccessMsg && (
                <div className="ck-notification ck-notification-success">
                  {otpSuccessMsg}
                </div>
              )}

              <p style={{
                fontSize: '14px', color: '#6B6B6B',
                margin: '16px 0 28px', lineHeight: 1.6
              }}>
                A 6-digit OTP was sent to{' '}
                <strong style={{ color: '#1A1A1A' }}>{email}</strong>.<br />
                Valid for 10 minutes. Check your spam folder if you don't see it.
              </p>

              {/* OTP INPUT BOXES */}
              <div
                onPaste={handleOtpPaste}
                style={{
                  display: 'flex', gap: '8px',
                  width: '100%', justifyContent: 'center',
                  marginBottom: '16px', boxSizing: 'border-box'
                }}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    className={`ck-otp-input${otpError ? ' error' : digit ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                    id={`otp-box-${i}`}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="ck-notification ck-notification-error">
                  {otpError}
                </div>
              )}

              <div className="ck-otp-resend">
                {resendTimer > 0 ? (
                  <span>Resend available in <strong>{resendTimer}s</strong></span>
                ) : (
                  <button onClick={handleResend} disabled={resending}>
                    {resending ? 'Sending…' : 'Resend OTP'}
                  </button>
                )}
              </div>

              <button
                className="ck-primary-btn"
                onClick={verifyOtp}
                id="verify-otp-btn"
                disabled={otp.join('').length < 6}
              >
                Verify &amp; Continue →
              </button>

              <button
                onClick={() => { setStep(0); setOtp(['','','','','','']); setOtpError('') }}
                id="change-email-btn"
                style={{
                  width: '100%', background: 'transparent',
                  border: '1.5px solid #1B2B5E', color: '#1B2B5E',
                  fontWeight: 700, padding: '12px', borderRadius: '10px',
                  cursor: 'pointer', marginTop: '12px', fontSize: '14px',
                  fontFamily: 'var(--font-display, Urbanist, sans-serif)'
                }}
              >
                ← Change email address
              </button>
            </div>
          )}

          {/* ══════════════════ STEP 3 — ORDER SUMMARY ══════════════════ */}
          {step === 2 && (
            <div className="ck-form-card agp-order-card">
              <h2 style={{
                fontSize: '24px', fontWeight: 800,
                color: '#1A1A1A', margin: '0 0 6px',
                fontFamily: 'var(--font-display, Urbanist, sans-serif)'
              }}>
                Order Summary
              </h2>
              <p style={{
                fontSize: '14px', color: '#6B6B6B', margin: '0 0 24px'
              }}>
                Apply a promo code to save more.
              </p>

              {/* Prominent pricing display */}
              <div style={{
                background: '#F8FAFF', borderRadius: '12px',
                padding: '20px', textAlign: 'center',
                marginBottom: '20px', border: '1px solid #E0E7FF'
              }}>
                <p style={{
                  textDecoration: 'line-through', color: '#9CA3AF',
                  fontSize: '14px', margin: '0 0 6px'
                }}>
                  Standard Setup: ₹60,000 (excl. GST)
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '10px'
                }}>
                  <span style={{
                    fontSize: '36px', fontWeight: 900, color: '#1B2B5E',
                    fontFamily: 'var(--font-display, Urbanist, sans-serif)'
                  }}>
                    {fmt(finalPrice)}
                  </span>
                  {appliedPromo && (
                    <span style={{
                      background: '#DCFCE7', color: '#16A34A',
                      fontSize: '12px', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '20px'
                    }}>
                      Save ₹{(BASE_PRICE - PROMO_DISCOUNTED_BASE).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '13px', color: '#6B6B6B', marginBottom: '4px'
                  }}>
                    <span>Base price</span>
                    <span>₹{displayBasePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '13px', color: '#6B6B6B', marginBottom: '8px'
                  }}>
                    <span>GST (18%)</span>
                    <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '14px', fontWeight: 800, color: '#1B2B5E',
                    borderTop: '1px solid #E0E7FF', paddingTop: '8px'
                  }}>
                    <span>Total (incl. GST)</span>
                    <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Promo code */}
              <p style={{
                fontSize: '12px', fontWeight: 600,
                color: '#6B6B6B', marginBottom: '8px'
              }}>
                Have a promo code?
              </p>
              {!appliedPromo ? (
                <>
                  <div className="ck-promo-row">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                      id="promo-input"
                      className="ck-promo-input"
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    />
                    <button className="ck-promo-btn" onClick={applyPromo} id="apply-promo-btn">Apply</button>
                  </div>
                  {promoError && (
                    <div className="ck-notification ck-notification-error" style={{ padding: '10px 14px', fontSize: '13px' }}>
                      {promoError}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="ck-promo-applied">
                    <span>🎉 {appliedPromo} applied!</span>
                    <button onClick={() => {
                      setAppliedPromo(null)
                      setPromoInput('')
                      setDisplayBasePrice(BASE_PRICE)
                      setGstAmount(GST_ON_FULL)
                      setFinalPrice(TOTAL_WITH_GST)
                    }} aria-label="Remove promo">✕</button>
                  </div>
                  <div className="ck-promo-timer">
                    ⏱ Offer valid for: <span className={promoSecondsLeft < 120 ? 'urgent' : ''}>{promoMinutes}:{promoSecs}</span>
                  </div>
                </>
              )}

              {/* Order rows */}
              <div className="ck-order-summary">
                <div className="ck-order-row">
                  <span>Direct Buyer Pipeline</span>
                  <span>₹{displayBasePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="ck-order-row" style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '14px', color: '#6B6B6B',
                  padding: '10px 0',
                  borderBottom: '1px solid #F0F0F0',
                  marginBottom: '8px'
                }}>
                  <span>GST @ 18%</span>
                  <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="ck-order-row total">
                  <span>Total</span>
                  <span>{fmt(finalPrice)}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                className="ck-primary-btn"
                onClick={handlePay}
                id="pay-now-btn"
                disabled={paying}
              >
                {paying
                  ? 'Opening Payment…'
                  : `PAY ${fmt(finalPrice)} SECURELY →`
                }
              </button>

              <p style={{
                textAlign: 'center', fontSize: '12px',
                color: '#9CA3AF', margin: '12px 0'
              }}>
                🔒 Secured by Razorpay · SSL encrypted · One-time payment
              </p>

              <button
                onClick={() => navigate('/pay-advance')}
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', color: '#9CA3AF',
                  fontSize: '13px', cursor: 'pointer',
                  padding: '8px', textDecoration: 'underline'
                }}
              >
                Need to split payments? Pay Advance →
              </button>
            </div>
          )}

        </div>{/* end right column */}
      </div>{/* end checkout-grid */}
    </div>
  )
}
