import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/thankyou.css'

export default function ThankYouPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const paymentId = state?.paymentId || 'N/A'
  const name      = state?.name || 'there'

  return (
    <div className="thankyou-page">
      <div className="thankyou-card">
        <div className="thankyou-icon">🎉</div>

        <h1 className="thankyou-title">
          Welcome,<br /><span>{name.split(' ')[0]}!</span>
        </h1>
        <p className="thankyou-sub">
          Your payment is confirmed and your access to the Aadai Growth Partners
          Direct Buyer Pipeline is now active. Check your email for onboarding details.
        </p>

        <div className="thankyou-payment-id">
          Payment ID: <span>{paymentId}</span>
        </div>

        <div className="thankyou-steps">
          <h4>What happens next?</h4>
          {[
            'Check your email — onboarding instructions + WhatsApp group invite sent within 10 minutes.',
            'Join the WhatsApp group — your first batch of verified buyer profiles will arrive Monday or Thursday.',
            'Book your 1-on-1 strategy call — link in your welcome email. Gets you closing-ready in 30 minutes.',
            'Start connecting with buyers and closing deals!',
          ].map((step, i) => (
            <div className="thankyou-step" key={i}>
              <div className="thankyou-step__num">{i + 1}</div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="thankyou-contact">
          Questions? Email us at{' '}
          <a href="mailto:aadaigrowthpartners@gmail.com">aadaigrowthpartners@gmail.com</a>
          {' '}and we'll reply within 4 hours.
        </div>

        <button className="btn-secondary thankyou-home" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    </div>
  )
}
