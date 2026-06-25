import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiateSingleAdvancePayment } from '../services/payAdvanceService';
import Header from '../components/Header';

const ADVANCE_AMOUNT = 5000; // flat ₹5,000 — NO GST

export default function PayAdvancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // User data — sourced from sessionStorage, never from a form
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-fill from CheckoutPage session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('aadai_otp_session');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.name)              setName(data.name);
        if (data.email)             setEmail(data.email);
        if (data.phone || data.mobile) setPhone(data.phone || data.mobile);
      }
    } catch (e) {
      console.error('Session read error:', e);
    }
  }, []);

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const userData = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      const result = await initiateSingleAdvancePayment(userData);
      navigate('/thank-you', {
        state: {
          isAdvance: true,
          planName:  result.planName,
          amount:    result.amount,
          paymentId: result.paymentId,
          name:      userData.name
        }
      });
    } catch (err) {
      if (err.message !== 'Payment dismissed by user') {
        setError('Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh' }}>
      <Header />

      <style>{`
        .adv-grid {
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          margin: 0 auto;
        }
        .adv-left {
          width: 100%;
          padding: 28px 20px;
          border-bottom: 1px solid #EEEEEE;
          order: 1;
        }
        .adv-right {
          width: 100%;
          padding: 28px 20px;
          order: 2;
        }
        @media (min-width: 1024px) {
          .adv-grid {
            flex-direction: row;
            align-items: flex-start;
          }
          .adv-left {
            width: 42%;
            border-bottom: none;
            border-right: 1px solid #EEEEEE;
            padding: 48px 40px;
            position: sticky;
            top: 72px;
            order: 1;
          }
          .adv-right {
            width: 58%;
            padding: 48px 48px;
            order: 2;
          }
        }
        .adv-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid #F0F0F0;
          gap: 12px;
        }
        .adv-item-row:last-child {
          border-bottom: none;
        }
        .adv-pay-btn {
          width: 100%;
          background: #1B2B5E;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 800;
          padding: 18px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.03em;
          min-height: 56px;
          transition: opacity 0.2s, transform 0.2s;
          font-family: var(--font-display, 'Urbanist', sans-serif);
          box-shadow: 0 4px 16px rgba(27, 43, 94, 0.25);
        }
        .adv-pay-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .adv-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="adv-grid">

        {/* ===== LEFT COLUMN — VALUE STACK ===== */}
        <div className="adv-left">

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
              { label: 'Direct-to-WhatsApp Meta Buyer Flow',      value: '₹35,000'    },
              { label: 'The AI WhatsApp Buyer-Lock System',        value: '₹45,000/mo' },
              { label: 'The Qualified-to-Closed 30-Day Playbook', value: '₹35,000'    },
            ].map((item, i) => (
              <div key={i} className="adv-item-row">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{
                    color: '#22C55E', fontWeight: 800,
                    fontSize: '15px', flexShrink: 0, marginTop: '1px'
                  }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#1A1A1A', lineHeight: 1.45 }}>
                    {item.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '13px', color: '#6B6B6B',
                  whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Total strikethrough */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: '16px',
            borderTop: '1px solid #EEEEEE',
            marginTop: '8px', marginBottom: '20px'
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
              Full Package Price
            </p>
            <p style={{
              fontSize: '32px', fontWeight: 900,
              color: '#FFFFFF', margin: '0 0 4px', lineHeight: 1,
              fontFamily: 'var(--font-display, Urbanist, sans-serif)'
            }}>
              ₹60,000
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
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
            <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
              Only <strong>1 factory per garment category</strong> accepted.
              Once your slot is taken, it's gone forever.
            </p>
          </div>

        </div>

        {/* ===== RIGHT COLUMN — ADVANCE PAYMENT SUMMARY ===== */}
        <div className="adv-right">

          {/* Back link */}
          <button
            onClick={() => navigate('/checkout')}
            style={{
              background: 'transparent', border: 'none',
              color: '#6B6B6B', fontSize: '13px',
              cursor: 'pointer', padding: '0 0 24px',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            ← Back to checkout
          </button>

          {/* Page title */}
          <h2 style={{
            fontSize: '26px', fontWeight: 900,
            color: '#1A1A1A', margin: '0 0 6px',
            fontFamily: 'var(--font-display, Urbanist, sans-serif)'
          }}>
            Secure Your Category Lock
          </h2>
          <p style={{
            fontSize: '14px', color: '#6B6B6B',
            margin: '0 0 28px', lineHeight: 1.6
          }}>
            Pay ₹5,000 today to lock your exclusive Founding Batch spot
            and block your competitors. Balance is only due before your
            Meta Ads and AI Bot go live.
          </p>

          {/* Pre-filled user info banner */}
          {name && (
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px', display: 'flex',
              alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '18px' }}>✅</span>
              <div>
                <p style={{
                  fontSize: '13px', fontWeight: 700,
                  color: '#15803D', margin: '0 0 2px'
                }}>
                  Booking for: {name}
                </p>
                <p style={{ fontSize: '12px', color: '#16A34A', margin: 0 }}>
                  {email}{phone ? ` · ${phone}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Order Summary Card */}
          <div style={{
            background: '#FFFFFF', borderRadius: '16px',
            border: '1px solid #E8E8E8',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            padding: '24px', marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '16px', fontWeight: 700,
              color: '#1A1A1A', margin: '0 0 16px'
            }}>
              Order Summary
            </h3>

            {/* Package row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', paddingBottom: '14px',
              borderBottom: '1px solid #F0F0F0', gap: '12px'
            }}>
              <span style={{ fontSize: '14px', color: '#6B6B6B' }}>Package</span>
              <span style={{
                fontSize: '14px', color: '#1A1A1A',
                fontWeight: 600, textAlign: 'right', maxWidth: '200px'
              }}>
                The Qualified Buyer System (Category Lock)
              </span>
            </div>

            {/* Advance amount row */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '12px 0',
              borderBottom: '1px solid #F0F0F0'
            }}>
              <span style={{ fontSize: '14px', color: '#6B6B6B' }}>
                Advance Amount
              </span>
              <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 600 }}>
                ₹{ADVANCE_AMOUNT.toLocaleString('en-IN')}
              </span>
            </div>

            {/* GST row — not applicable on advance */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '8px 0',
              borderBottom: '1px solid #F0F0F0'
            }}>
              <span style={{ fontSize: '13px', color: '#6B6B6B' }}>GST</span>
              <span style={{
                fontSize: '12px', color: '#16A34A',
                fontWeight: 600,
                background: '#F0FDF4',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>
                Not applicable on advance
              </span>
            </div>

            {/* Amount due today — highlighted */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', paddingTop: '16px',
              marginTop: '4px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>
                Advance Due Today
              </span>
              <span style={{
                fontSize: '32px', fontWeight: 900, color: '#1B2B5E',
                fontFamily: 'var(--font-display, Urbanist, sans-serif)'
              }}>
                ₹5,000
              </span>
            </div>
            <p style={{
              fontSize: '12px', color: '#6B6B6B',
              margin: '8px 0 0', textAlign: 'right',
              fontStyle: 'italic'
            }}>
              GST will apply on remaining balance at time of full payment
            </p>
          </div>

          {/* What happens next card */}
          <div style={{
            background: '#F8FAFF', border: '1px solid #E0E7FF',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px', fontWeight: 700,
              color: '#1B2B5E', margin: '0 0 10px',
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              What happens after payment?
            </p>
            {[
              'Your garment category is immediately locked',
              'Our team contacts you on WhatsApp within 24 hours',
              'Remaining ₹30,000 due before campaign goes live',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                marginBottom: i < 2 ? '8px' : '0'
              }}>
                <span style={{
                  color: '#1B2B5E', fontWeight: 800,
                  fontSize: '13px', flexShrink: 0
                }}>
                  {i + 1}.
                </span>
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* PAY BUTTON */}
          <button
            className="adv-pay-btn"
            disabled={loading}
            onClick={handlePay}
          >
            {loading ? 'Opening Payment…' : 'PAY ₹5,000 & SECURE MY CATEGORY'}
          </button>

          {/* Error message */}
          {error && (
            <p style={{
              color: '#DC2626', fontSize: '13px',
              textAlign: 'center', marginTop: '10px'
            }}>
              {error}
            </p>
          )}

          {/* Security line */}
          <p style={{
            textAlign: 'center', fontSize: '12px',
            color: '#9CA3AF', marginTop: '14px'
          }}>
            🔒 Safe &amp; Secure 256-bit encrypted checkout · Powered by Razorpay
          </p>

        </div>
      </div>
    </div>
  );
}
