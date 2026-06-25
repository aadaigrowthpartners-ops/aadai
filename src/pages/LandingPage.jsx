import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import '../styles/landing.css'

const FAQS = [
  { q: 'Are my leads shared?',            a: 'No. 100% exclusive to you.' },
  { q: "What if they don't meet my MOQ?", a: 'The AI politely filters them out before you ever speak to them.' },
  { q: 'Do I have to build the ads?',     a: 'We handle everything end-to-end.' },
]

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()

  /* ── Sticky bar ── */
  const [stickyVisible, setStickyVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── FAQ accordion ── */
  const [openFaq, setOpenFaq] = useState(null)

  /* ── Smooth scroll to CTA section ── */
  const goToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Header />

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section className="hero agp-hero" id="hero">
        <div className="hero__glow" />
        <div className="container">
          <div className="hero__content">
            <div className="hero__badge agp-hero-badge">
              <span className="hero__badge-dot" />
              Founding Batch — Tiruppur Garment Manufacturers
            </div>

            <h1 className="hero__title agp-hero-title">
              Stop Chasing Shared Leads.<br />
              <span className="line-gold">Get Direct-to-WhatsApp</span><br />
              Wholesale Buyers.
            </h1>

            <p className="hero__sub agp-hero-sub">
              We build AI-qualified, exclusive revenue engines for Tiruppur's top
              garment manufacturers. No middlemen. No racing to the bottom on price.
            </p>

            <div className="hero__cta-group agp-hero-cta-group">
              <button
                className="btn-primary hero__cta"
                id="hero-cta-main"
                onClick={goToCheckout}
              >
                Secure My Spot
              </button>
            </div>

            {/* Trust badges */}
            <div className="hero__trust-badges">
              <span className="hero__trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                Meta Partner
              </span>
              <span className="hero__trust-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                WhatsApp API
              </span>
              <span className="hero__trust-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.5 }}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                100% Exclusive Category Lock-Out
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — THE PROBLEM
      ══════════════════════════════════════ */}
      <section className="section" id="problem">
        <div className="container">
          <div className="section__head">
            <span className="section-label">The Problem</span>
            <h2 className="section-title">The B2B Directory Trap is<br /><span>Killing Your Margins.</span></h2>
          </div>

          <div className="problem-grid">
            {[
              {
                icon: '🔁',
                title: 'The Shared Lead Trap',
                text: "You pay a directory platform for a buyer's inquiry, but they sell that exact same lead to 10 of your competitors instantly."
              },
              {
                icon: '📉',
                title: 'The Price War',
                text: 'Because the buyer is talking to 10 factories, you are forced to haggle over pennies just to win the order.'
              },
              {
                icon: '⏳',
                title: 'The Time Waster',
                text: 'Your phone rings constantly with buyers who just want a free sample or only want 10 pieces.'
              },
            ].map(p => (
              <div className="problem-card" key={p.title}>
                <div className="problem-card__icon">{p.icon}</div>
                <div className="problem-card__title">{p.title}</div>
                <div className="problem-card__text">{p.text}</div>
              </div>
            ))}
          </div>

          <p className="problem-closing">
            You shouldn't have to fight for scraps. You need serious buyers
            who respect your Minimum Order Quantity.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — THE PROOF
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="proof">
        <div className="container">
          <div className="section__head">
            <span className="section-label">The Proof</span>
            <h2 className="section-title">The Only Problem You Should Have<br /><span>is a Full Factory.</span></h2>
          </div>

          <div className="proof-card">
            <div className="proof-stats">
              {[
                { num: '₹7 Lakhs+', label: 'in direct revenue generated in 30 days' },
                { num: '10–12',     label: 'solid wholesale clients closed' },
                { num: '100%',      label: 'Factory reached full production capacity' },
              ].map(s => (
                <div key={s.label}>
                  <div className="proof-stat__num">{s.num}</div>
                  <div className="proof-stat__label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="proof-note">
              <strong>Result:</strong> Marketing was paused because the factory reached 100% production capacity.
            </div>

            <div className="proof-testimonial">
              <p className="proof-testimonial__quote">
                "Aadai Growth Partners didn't just give us leads; they gave us a system that completely bypassed the directories.
                Our margins have never been better."
              </p>
              <div className="proof-testimonial__attr">— Founding Batch Client, Tiruppur</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION — hidden until content is ready */}
      {false && (
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section__head">
            <span className="section-label">What Our Clients Say</span>
            <h2 className="section-title">Real results from <span>Tiruppur's garment manufacturers.</span></h2>
          </div>

          {/* Responsive 2-col grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>

            {/* ── TESTIMONIAL CARD 1 — Video ── */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #EEEEEE',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              {/* Label pill */}
              <span style={{
                background: '#EEF2FF',
                color: '#1B2B5E',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'inline-block',
                marginBottom: '14px'
              }}>
                Video Testimonial
              </span>

              {/* Video embed area */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#F0F0F0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* ── PASTE VIDEO EMBED HERE ──
                    Replace the placeholder div below with your video iframe or HTML5 video tag.

                    YouTube example:
                    <iframe
                      width="100%" height="100%"
                      src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                      frameBorder="0" allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />

                    Direct video file example:
                    <video width="100%" height="100%" controls style={{ objectFit: 'cover' }}>
                      <source src="/testimonials/client1.mp4" type="video/mp4" />
                    </video>
                */}
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>▶</div>
                  <p style={{ fontSize: '13px' }}>Video Testimonial — Paste embed here</p>
                </div>
              </div>

              {/* Attribution + quote */}
              <p style={{ fontSize: '14px', color: '#1A1A1A', fontStyle: 'italic', lineHeight: 1.65, marginBottom: '10px' }}>
                "Aadai Growth Partners didn't just give us leads; they gave us
                a system that completely bypassed the directories.
                Our margins have never been better."
              </p>
              <p style={{ fontSize: '13px', color: '#AAAAAA', fontWeight: 600 }}>
                — Founding Batch Client, Tiruppur
              </p>
            </div>

            {/* ── TESTIMONIAL CARD 2 — Audio ── */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #EEEEEE',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              {/* Label pill */}
              <span style={{
                background: '#FFF8EE',
                color: '#B8932A',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'inline-block',
                marginBottom: '14px'
              }}>
                Audio Testimonial
              </span>

              {/* Audio embed area */}
              <div style={{
                width: '100%',
                background: '#F8F8F8',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                {/* ── PASTE AUDIO EMBED HERE ──
                    Replace the placeholder content below with your audio tag.

                    Example:
                    <audio controls style={{ width: '100%' }}>
                      <source src="/testimonials/client2.mp3" type="audio/mpeg" />
                    </audio>
                */}

                {/* Placeholder waveform visual */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  height: '40px'
                }}>
                  {[12,20,35,28,40,32,18,38,25,30,22,36,28,15,32,40,20,28,35,18].map((h, i) => (
                    <div key={i} style={{
                      width: '3px',
                      height: h + 'px',
                      background: '#B8932A',
                      borderRadius: '2px',
                      opacity: 0.6
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                  Audio Testimonial — Paste audio embed here
                </p>
              </div>

              {/* Attribution + quote */}
              <p style={{ fontSize: '14px', color: '#1A1A1A', fontStyle: 'italic', lineHeight: 1.65, marginBottom: '10px' }}>
                "Within 30 days, our factory was running at full capacity.
                We had to pause marketing because we couldn't handle more orders."
              </p>
              <p style={{ fontSize: '13px', color: '#AAAAAA', fontWeight: 600 }}>
                — Garment Manufacturer, Tiruppur
              </p>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* ══════════════════════════════════════
          SECTION 4 — THE 3-STEP PLAN
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="how-it-works">
        <div className="container">
          <div className="section__head">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">How to Build Your<br /><span>Direct Buyer Engine.</span></h2>
          </div>

          <div className="process-steps">
            {[
              {
                title: 'Secure Your Category.',
                text: 'Lock in your garment category. We only take ONE factory per category to guarantee your buyer flow is 100% exclusive.'
              },
              {
                title: 'We Deploy the AI Flow.',
                text: 'We build your custom Meta Ads and train our AI Bot on your specific MOQ, pricing, and catalog.'
              },
              {
                title: 'Wake Up to Qualified Orders.',
                text: 'Your phone only pings when a serious wholesale buyer has passed the AI check and is ready to talk business.'
              },
            ].map((s, i) => (
              <div className="process-step" key={s.title}>
                <div className="process-step__left">
                  <div className="process-step__num">{i + 1}</div>
                  <div className="process-step__line" />
                </div>
                <div className="process-step__body">
                  <div className="process-step__title">{s.title}</div>
                  <div className="process-step__text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              className="btn-primary hero__cta"
              id="process-cta"
              onClick={goToCheckout}
            >
              Secure My Spot
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — CTA BANNER
          (replaces the checkout stack)
      ══════════════════════════════════════ */}
      <section id="checkout-section" style={{
        background: '#1B2B5E',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#B8932A',
          fontSize: '14px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          Limited Spots — Tiruppur Only
        </p>
        <h2 style={{
          color: '#FFFFFF',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: 800,
          marginBottom: '16px',
          lineHeight: 1.2
        }}>
          Ready to Lock Your Category?
        </h2>
        <p style={{
          color: '#CCCCCC',
          fontSize: '18px',
          marginBottom: '32px',
          maxWidth: '520px',
          margin: '0 auto 32px'
        }}>
          Only ONE factory per garment category.
          Once your slot is taken, it's gone.
        </p>
        <button
          onClick={() => navigate('/checkout')}
          id="cta-section-btn"
          style={{
            background: '#F5A623',
            color: '#000000',
            fontWeight: 800,
            fontSize: '18px',
            padding: '18px 48px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em'
          }}
        >
          Secure My Spot →
        </button>
        <p style={{
          color: '#888888',
          fontSize: '12px',
          marginTop: '16px'
        }}>
          🔒 Safe &amp; Secure 256-bit encrypted checkout
        </p>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — FAQ
      ══════════════════════════════════════ */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section__head">
            <h2 className="section-title" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Stop competing. <span>Start dominating</span> your category.
            </h2>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  id={`faq-${i}`}
                >
                  {faq.q}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STICKY BAR
      ══════════════════════════════════════ */}
      <div className={`sticky-bar ${stickyVisible ? 'visible' : ''}`} id="sticky-bar">
        <div className="sticky-bar__text">
          🔥 Founding Batch closing soon
        </div>
        <button
          className="btn-primary sticky-bar__cta"
          onClick={() => navigate('/checkout')}
          id="sticky-cta"
        >
          Secure My Spot →
        </button>
      </div>
    </>
  )
}
