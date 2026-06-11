import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROMO_CODES, SELLING_PRICE, PROMO_TIMER_MINUTES } from '../config/promoCodes'
import { sendOtpEmail, sendLeadEmail } from '../services/emailService'
import { openPaymentModal } from '../services/paymentService'
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

/* ── Step indicator ── */
function Steps({ current }) {
  const items = ['Your Details', 'Verify OTP', 'Order Summary']
  return (
    <div className="steps">
      {items.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`step-item ${current === i ? 'active' : ''} ${current > i ? 'done' : ''}`}>
            <div className="step-item__num">{current > i ? '✓' : i + 1}</div>
            <span className="step-item__label">{label}</span>
          </div>
          {i < items.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
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
  const [appliedPromo,      setAppliedPromo]      = useState(null)
  const [promoError,        setPromoError]        = useState('')
  const [promoSecondsLeft,  setPromoSecondsLeft]  = useState(PROMO_TIMER_MINUTES * 60)
  const [finalPrice,        setFinalPrice]        = useState(SELLING_PRICE)
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
      setAppliedPromo(null)
      setPromoInput('')
      setPromoError('Promo code expired. Please request a new offer code.')
    }
  }, [promoSecondsLeft, appliedPromo])

  /* ── Recalculate price ── */
  useEffect(() => {
    setFinalPrice(
      appliedPromo
        ? Math.round(SELLING_PRICE * (1 - appliedPromo.discount / 100))
        : SELLING_PRICE
    )
  }, [appliedPromo])

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

  /* ── Promo ── */
  function applyPromo() {
    const found = PROMO_CODES.find(
      p => p.active && p.code === promoInput.trim().toUpperCase()
    )
    if (found) { 
      setAppliedPromo(found)
      setPromoSecondsLeft(PROMO_TIMER_MINUTES * 60)
      setPromoError('') 
    } else { 
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
        promoCode:     appliedPromo?.code || 'None',
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
    <>
      <div className="checkout-page">
        <Steps current={step} />

        {/* ══════════════════ STEP 1 ══════════════════ */}
        {step === 0 && (
          <div className="checkout-card">
            <div className="checkout-card__title">Your Details</div>
            <div className="checkout-card__sub">We'll send your OTP to the email below.</div>

            {otpSuccessMsg && (
              <div className="notification notification-success">
                {otpSuccessMsg}
              </div>
            )}

            {/* Full Name */}
            <div className="form-field">
              <label htmlFor="ch-name">Full Name</label>
              <input
                id="ch-name"
                type="text"
                placeholder="Rajesh Iyer"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  if (touched.name) validateField('name', e.target.value)
                }}
                onBlur={() => handleBlur('name')}
                className={touched.name && fieldErrors.name ? 'error' : touched.name && !fieldErrors.name ? 'success' : ''}
              />
              {touched.name && fieldErrors.name && (
                <div className="field-error">{fieldErrors.name}</div>
              )}
            </div>

            {/* Email */}
            <div className="form-field">
              <label htmlFor="ch-email">Email Address</label>
              <input
                id="ch-email"
                type="text"
                placeholder="you@email.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (touched.email) validateField('email', e.target.value)
                }}
                onBlur={() => handleBlur('email')}
                className={touched.email && fieldErrors.email ? 'error' : touched.email && !fieldErrors.email ? 'success' : ''}
              />
              {touched.email && fieldErrors.email && (
                <div className="field-error">{fieldErrors.email}</div>
              )}
            </div>

            {/* Phone */}
            <div className="form-field">
              <label htmlFor="ch-phone">Mobile Number</label>
              <input
                id="ch-phone"
                type="text"
                placeholder="9876543210"
                inputMode="numeric"
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhone(val)
                  if (touched.phone) validateField('phone', val)
                }}
                onBlur={() => handleBlur('phone')}
                className={touched.phone && fieldErrors.phone ? 'error' : touched.phone && !fieldErrors.phone ? 'success' : ''}
              />
              {touched.phone && fieldErrors.phone && (
                <div className="field-error">{fieldErrors.phone}</div>
              )}
            </div>

            {globalError && (
              <div className="field-error" style={{ marginBottom: '1rem' }}>{globalError}</div>
            )}

            <button
              className="btn-primary btn-checkout"
              onClick={sendOtp}
              id="send-otp-btn"
              disabled={sending || !formIsValid}
            >
              {sending ? 'Sending OTP…' : 'Send OTP →'}
            </button>

            {!formIsValid && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.6rem' }}>
                Fill all fields correctly to continue
              </p>
            )}

          </div>
        )}

        {/* ══════════════════ STEP 2 ══════════════════ */}
        {step === 1 && (
          <div className="checkout-card">
            <div className="checkout-card__title">Verify Your Email</div>
            
            {otpSuccessMsg && (
              <div className="notification notification-success">
                {otpSuccessMsg}
              </div>
            )}

            <p className="otp__label">
              A 6-digit OTP was sent to <strong>{email}</strong>.<br />
              Valid for 10 minutes. Check your spam folder if you don't see it.
            </p>

            <div className="otp__boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  className={`otp__box ${otpError ? 'error' : digit ? 'filled' : ''}`}
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
              <div className="notification notification-error">
                {otpError}
              </div>
            )}

            <div className="otp__resend">
              {resendTimer > 0 ? (
                <span>Resend available in <strong>{resendTimer}s</strong></span>
              ) : (
                <button onClick={handleResend} disabled={resending}>
                  {resending ? 'Sending…' : 'Resend OTP'}
                </button>
              )}
            </div>

            <button
              className="btn-primary btn-checkout"
              onClick={verifyOtp}
              id="verify-otp-btn"
              disabled={otp.join('').length < 6}
            >
              Verify & Continue →
            </button>

            <button
              className="btn-secondary"
              onClick={() => { setStep(0); setOtp(['','','','','','']); setOtpError('') }}
              style={{ width: '100%', marginTop: '0.6rem', justifyContent: 'center' }}
              id="change-email-btn"
            >
              ← Change email address
            </button>
          </div>
        )}

        {/* ══════════════════ STEP 3 ══════════════════ */}
        {step === 2 && (
          <div className="checkout-card">
            <div className="checkout-card__title">Order Summary</div>
            <div className="checkout-card__sub">Apply a promo code to save more.</div>

            {/* Promo */}
            {!appliedPromo ? (
              <>
                <div className="promo-input-row">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                    id="promo-input"
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  />
                  <button className="btn-apply" onClick={applyPromo} id="apply-promo-btn">Apply</button>
                </div>
                {promoError && (
                  <div className="notification notification-error" style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '0.8rem' }}>
                    {promoError}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="promo-applied">
                  <span>🎉 {appliedPromo.label} applied!</span>
                  <button onClick={() => { setAppliedPromo(null); setPromoInput('') }} aria-label="Remove promo">✕</button>
                </div>
                <div className="promo-timer" style={{ justifyContent: 'center' }}>
                  ⏱ Offer valid for: <span className={promoSecondsLeft < 120 ? 'urgent' : ''}>{promoMinutes}:{promoSecs}</span>
                </div>
              </>
            )}

            {/* Summary */}
            <div className="order-summary">
              <div className="order-summary__row">
                <span>Direct Buyer Pipeline (12 months)</span>
                <span>{fmt(SELLING_PRICE)}</span>
              </div>
              {appliedPromo && (
                <div className="order-summary__row" style={{ color: 'var(--accent-green)' }}>
                  <span>Promo ({appliedPromo.code})</span>
                  <span>−{fmt(SELLING_PRICE - finalPrice)}</span>
                </div>
              )}
              <div className="order-summary__row total">
                <span>Total</span>
                <span>{fmt(finalPrice)}</span>
              </div>
            </div>

            <button
              className="btn-primary btn-checkout"
              onClick={handlePay}
              id="pay-now-btn"
              disabled={paying}
            >
              {paying ? 'Opening Payment…' : `🔒 Pay ${fmt(finalPrice)} Securely →`}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
              Secured by Razorpay · SSL encrypted · One-time payment
            </p>
          </div>
        )}
      </div>
    </>
  )
}
