import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdvancePlans, initiateAdvancePayment } from '../services/payAdvanceService';
import Header from '../components/Header';

export default function PayAdvancePage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = getAdvancePlans();

  async function handlePay() {
    if (!selectedPlan) return;
    setLoading(true);
    setError('');
    try {
      const userData = JSON.parse(sessionStorage.getItem('aadai_otp_session') || '{}');
      const result = await initiateAdvancePayment(selectedPlan, userData);
      navigate('/thank-you', {
        state: {
          isAdvance: true,
          planName: result.planName,
          amount: result.amount,
          remaining: result.remaining,
          paymentId: result.paymentId,
          name: userData.name || ''
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
    <div style={{ backgroundColor: '#0D0D0D', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* SHARED HEADER — single instance, no duplicate */}
      <Header />

      {/* MAIN CONTENT */}
      <main className="agp-advance-container" style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 1.5rem 5rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}
        >
          ← Back to checkout
        </button>

        {/* STEP INDICATOR */}
        <div className="agp-steps" style={{ alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="agp-step-circle" style={{ background: '#22C55E', color: '#FFF' }}>✓</div>
            <span className="agp-step-label" style={{ fontSize: '11px', fontWeight: 600, color: '#22C55E' }}>Your Details</span>
          </div>
          <div className="agp-step-connector" style={{ background: '#2A2A2A' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="agp-step-circle" style={{ background: '#22C55E', color: '#FFF' }}>✓</div>
            <span className="agp-step-label" style={{ fontSize: '11px', fontWeight: 600, color: '#22C55E' }}>Verify OTP</span>
          </div>
          <div className="agp-step-connector" style={{ background: '#2A2A2A' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="agp-step-circle" style={{ background: '#F5A623', color: '#000' }}>3</div>
            <span className="agp-step-label agp-step-active" style={{ fontSize: '11px', fontWeight: 600, color: '#F5A623' }}>Advance Payment</span>
          </div>
        </div>

        {/* PLAN SELECTION CARD */}
        <div className="agp-advance-card" style={{ background: '#1A1A1A', borderRadius: '12px', padding: '28px', border: '1px solid #2A2A2A' }}>
          <h1 className="agp-advance-title" style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0' }}>Choose Your Advance Plan</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px 0' }}>Reserve your slot today. Balance paid before campaign launch.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(plans).map(([id, plan]) => {
              const isSelected = selectedPlan === id;
              const badges = {
                1: 'Most Flexible',
                2: 'Popular',
                3: 'Best Value'
              };
              return (
                <div
                  key={id}
                  className="agp-plan-card"
                  onClick={() => setSelectedPlan(id)}
                  style={{
                    background: isSelected ? '#1A1400' : '#111',
                    border: isSelected ? '2px solid #F5A623' : '1px solid #2A2A2A',
                    borderLeft: isSelected ? '4px solid #F5A623' : '1px solid #2A2A2A',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                  }}
                >
                  <div className="agp-plan-card-inner">
                    <div className="agp-plan-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div className="agp-plan-name-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="agp-plan-name" style={{ color: '#FFF', fontSize: '15px', fontWeight: 600 }}>{plan.name}</span>
                        <span className="agp-plan-badge" style={{ background: '#F5A623', color: '#000', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                          {badges[id]}
                        </span>
                      </div>
                      <span className="agp-plan-remaining" style={{ color: '#888', fontSize: '12px' }}>Balance remaining: ₹{plan.remaining.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="agp-plan-right">
                      <span className="agp-plan-right-label" style={{ color: '#888', fontSize: '11px', marginBottom: '2px', display: 'block' }}>Pay today</span>
                      <span className="agp-plan-amount" style={{ color: '#F5A623', fontSize: '22px', fontWeight: 700 }}>{plan.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #2A2A2A', margin: '20px 0' }}></div>

          {/* MINI ORDER SUMMARY */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
            <span style={{ color: '#FFF' }}>Total Package Value</span>
            <span style={{ color: '#FFF' }}>₹35,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
            <span style={{ color: '#FFF' }}>Advance Selected</span>
            <span style={{ color: '#F5A623' }}>{selectedPlan ? plans[selectedPlan].label : "—"}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ color: '#FFF' }}>Remaining Balance</span>
            <span style={{ color: '#888' }}>{selectedPlan ? "₹" + plans[selectedPlan].remaining.toLocaleString('en-IN') : "—"}</span>
          </div>

          <div style={{ borderTop: '1px solid #2A2A2A', margin: '20px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#FFF', fontSize: '16px', fontWeight: 700 }}>Pay Today</span>
            <span style={{ color: '#F5A623', fontSize: '20px', fontWeight: 700 }}>{selectedPlan ? plans[selectedPlan].label : "—"}</span>
          </div>

          {/* PAY BUTTON */}
          <button
            className="agp-pay-btn"
            onClick={handlePay}
            disabled={!selectedPlan || loading}
            style={{
              width: '100%',
              background: '#F5A623',
              color: '#000',
              fontWeight: 700,
              fontSize: '16px',
              border: 'none',
              borderRadius: '8px',
              height: '52px',
              marginTop: '24px',
              cursor: (!selectedPlan || loading) ? 'not-allowed' : 'pointer',
              opacity: (!selectedPlan || loading) ? 0.5 : 1
            }}
          >
            {loading ? "Processing..." : selectedPlan ? "Pay " + plans[selectedPlan].label + " Now →" : "Select a Plan"}
          </button>

          {error && (
            <p style={{ color: '#FF4444', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
