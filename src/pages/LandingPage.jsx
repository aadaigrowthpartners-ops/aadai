import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ORIGINAL_PRICE, SELLING_PRICE } from '../config/promoCodes'
import '../styles/landing.css'

/* ── Helpers ── */
const fmt = (n) => '₹' + n.toLocaleString('en-IN')
const saved = Math.round(((ORIGINAL_PRICE - SELLING_PRICE) / ORIGINAL_PRICE) * 100)

/* ── Testimonials data ── */
const TESTIMONIALS = [
  {
    name: 'Rajesh Iyer',
    role: 'Builder, Chennai',
    stars: 5,
    quote: '"Within 3 weeks of joining, I closed a ₹1.8 Cr deal with a buyer from Aadai\'s pipeline. These aren\'t tire-kickers — they\'re people with money ready to deploy."',
    img: 'https://ui-avatars.com/api/?name=Rajesh+Iyer&background=F5A623&color=0A0A0F&bold=true',
  },
  {
    name: 'Meena Subramaniam',
    role: 'Property Consultant, Coimbatore',
    stars: 5,
    quote: '"I was spending ₹40K/month on ads and getting nowhere. One month with Aadai\'s pipeline and I had 14 genuine buyer meetings. ROI is unmatched."',
    img: 'https://ui-avatars.com/api/?name=Meena+Subramaniam&background=22C55E&color=0A0A0F&bold=true',
  },
  {
    name: 'Karthik Balaji',
    role: 'Developer, Madurai',
    stars: 5,
    quote: '"The WhatsApp group alone is worth 10x the price. Every week there\'s a new qualified buyer looking for exactly what I have. Closed 2 deals in 45 days."',
    img: 'https://ui-avatars.com/api/?name=Karthik+Balaji&background=6366F1&color=fff&bold=true',
  },
  {
    name: 'Priya Venkatesh',
    role: 'Real Estate Agent, Trichy',
    stars: 5,
    quote: '"I was skeptical at first. But the buyer profiles are incredibly detailed — budget, timeline, preferred location. My closing rate jumped from 8% to 31%."',
    img: 'https://ui-avatars.com/api/?name=Priya+Venkatesh&background=EC4899&color=fff&bold=true',
  },
  {
    name: 'Suresh Mohan',
    role: 'Investor, Tirunelveli',
    stars: 5,
    quote: '"Finally, a product built for Tamil Nadu real estate. Verified local buyers, regional support, transparent pricing. This is the future of property sales here."',
    img: 'https://ui-avatars.com/api/?name=Suresh+Mohan&background=14B8A6&color=0A0A0F&bold=true',
  },
]

const FAQS = [
  { q: 'Who are these "direct buyers"?', a: 'These are pre-verified individuals and investors who have confirmed budget (₹50L–₹5Cr), a specific location preference, and a genuine intent to purchase within 30–90 days. We do not share tire-kickers or window shoppers.' },
  { q: 'How is this different from JD, MagicBricks, or housing portals?', a: 'Portals sell you leads — unverified enquiries from anyone who clicks. We give you access to a curated pipeline of confirmed buyers who have been qualified by our team. You spend time closing, not cold-calling.' },
  { q: 'Is the ₹35,000 a one-time payment?', a: 'Yes, completely one-time. No monthly subscription, no hidden charges. You get 12 months of full access for a single payment.' },
  { q: 'What if I don\'t close any deal?', a: 'If within 90 days you have not been connected to a single qualifying buyer, we will personally review your profile and extend your access for an additional 3 months at no cost.' },
  { q: 'Is this available outside Tamil Nadu?', a: 'Currently we exclusively serve Tamil Nadu — Chennai, Coimbatore, Madurai, Trichy, Tirunelveli, Salem, Erode, and surrounding districts. This focus ensures buyer quality.' },
  { q: 'How do I receive buyer profiles?', a: 'Immediately after payment you are added to our private WhatsApp group. Buyer profiles are shared every Monday and Thursday. You can also search our buyer directory through the member portal.' },
]

const PROBLEMS = [
  { icon: '📣', title: 'Wasting money on cold leads', text: 'You spend lakhs on portals and ads. Most enquiries are unqualified, out-of-budget, or just researching. Your follow-up calls go unanswered.' },
  { icon: '⏳', title: 'Months of wasted meetings', text: 'Site visits with people who were never serious. Negotiation theatre with no intention to close. Your calendar full, your pipeline empty.' },
  { icon: '💸', title: 'Commission delays and disputes', text: 'Chasing clients for payment after months of work. Buyers disappear. Builders stall. You\'re left chasing ghosts.' },
  { icon: '🔍', title: 'No verified buyer network', text: 'Word-of-mouth only goes so far. You have no systematic way to find high-intent buyers ready to close in the next 30–90 days.' },
]

const PROCESS_STEPS = [
  { title: 'You join the pipeline', text: 'One-time payment of ₹35,000. Instantly onboarded to our private network with full access to the buyer database and WhatsApp group.' },
  { title: 'We share verified buyer profiles', text: 'Every week, fresh profiles of pre-qualified buyers: budget confirmed, location locked, timeline defined. No noise, only signal.' },
  { title: 'You connect directly', text: 'No middleman. No commission split. You reach out to buyers directly using their contact details. No waiting room, no queue.' },
  { title: 'You present and negotiate', text: 'Buyers are already warmed up. They know what they want. Your job is to match and close — not educate and convince.' },
  { title: 'You close and get paid', text: 'Deal done. Full commission yours. Repeat with the next buyer. Average member closes their first deal within 45 days.' },
]

const OFFER_ITEMS = [
  { icon: '👥', title: 'Direct Buyer Pipeline Access', sub: '12 months full access to pre-verified buyers across Tamil Nadu' },
  { icon: '💬', title: 'Private WhatsApp Group', sub: 'Weekly buyer profiles + live deal alerts sent directly to you' },
  { icon: '📋', title: 'Buyer Profile Database', sub: 'Searchable directory: filter by budget, location, timeline, property type' },
  { icon: '📞', title: 'Direct Contact Details', sub: 'Phone numbers and emails — reach buyers without any gatekeeping' },
  { icon: '🤝', title: '1-on-1 Onboarding Call', sub: '30-minute strategy session to maximise your first 30 days' },
]

const BONUS_ITEMS = [
  'Closing scripts for Tamil Nadu buyers (English + Tamil)',
  'NRI buyer sub-group access',
  'Monthly market intelligence report',
  'Priority listing in our seller directory',
]

/* ═══════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const [stickyVisible, setStickyVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [openFaq, setOpenFaq]         = useState(null)
  const carouselRef = useRef(null)
  const autoRef     = useRef(null)

  /* scroll effects */
  useEffect(() => {
    const onScroll = () => {
      setStickyVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* auto-rotate testimonials */
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(autoRef.current)
  }, [])

  const prevTestimonial = () => {
    clearInterval(autoRef.current)
    setActiveTestimonial(p => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }
  const nextTestimonial = () => {
    clearInterval(autoRef.current)
    setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length)
  }

  const goCheckout = () => navigate('/checkout')

  return (
    <>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero" id="hero">
        <div className="hero__grid-bg" />
        <div className="hero__glow" />
        <div className="container">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              Limited Spots Available — Tamil Nadu Only
            </div>

            <h1 className="hero__title">
              Stop Chasing<br />
              <span className="line-gold">Cold Leads.</span><br />
              <span className="line-dim">Get Direct Buyers.</span>
            </h1>

            <p className="hero__sub">
              Join Tamil Nadu's most exclusive real estate buyer pipeline. Pre-verified buyers
              with confirmed budgets of ₹50L–₹5Cr, ready to close within 30–90 days.
              No portals. No middlemen. No cold calls.
            </p>

            <div className="hero__price-block">
              <div>
                <div className="hero__price-old">{fmt(ORIGINAL_PRICE)}</div>
              </div>
              <div className="hero__price-arrow">→</div>
              <div className="hero__price-new">{fmt(SELLING_PRICE)}</div>
              <div className="hero__price-save">Save {saved}%</div>
            </div>

            <div className="hero__cta-group">
              <button className="btn-primary hero__cta" onClick={goCheckout} id="hero-cta-main">
                🚀 Claim Your Spot — {fmt(SELLING_PRICE)}
              </button>
              <a className="btn-secondary" href="#how-it-works">See How It Works</a>
            </div>

            <p className="hero__guarantee">
              <span>✓ 90-Day</span> Buyer Guarantee &nbsp;·&nbsp;
              <span>✓ One-Time</span> Payment &nbsp;·&nbsp;
              <span>✓ No Subscription</span>
            </p>

            <div className="hero__stats">
              {[
                { num: '500+', label: 'Active Verified Buyers' },
                { num: '₹210Cr+', label: 'Deals Closed via Pipeline' },
                { num: '45 Days', label: 'Avg. First Close Time' },
                { num: '12 Months', label: 'Full Access Period' },
              ].map(s => (
                <div key={s.label}>
                  <div className="hero__stat-num">{s.num}</div>
                  <div className="hero__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROBLEM
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="problem">
        <div className="container">
          <div className="section__head">
            <span className="section-label">The Problem</span>
            <h2 className="section-title">Why Most Agents<br /><span>Never Hit Their Income Goals</span></h2>
            <p className="section-sub">The old way of doing real estate is broken. Here's what's keeping you stuck.</p>
          </div>
          <div className="problem-grid">
            {PROBLEMS.map(p => (
              <div className="problem-card" key={p.title}>
                <div className="problem-card__icon">{p.icon}</div>
                <div className="problem-card__title">{p.title}</div>
                <div className="problem-card__text">{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROCESS
      ══════════════════════════════════════ */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section__head">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Your Pipeline to <span>Closing Deals</span></h2>
            <p className="section-sub">A simple, proven system. From payment to first deal in under 45 days.</p>
          </div>
          <div className="process-steps">
            {PROCESS_STEPS.map((s, i) => (
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
        </div>
      </section>

      {/* ══════════════════════════════════════
          OFFER
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="offer">
        <div className="container">
          <div className="section__head">
            <span className="section-label">What You Get</span>
            <h2 className="section-title">Everything in <span>One Package</span></h2>
            <p className="section-sub">One payment. Twelve months. An unfair advantage over every competitor in your market.</p>
          </div>
          <div className="offer-grid">
            <div className="offer-main">
              <div className="offer-main__title">Core Access</div>
              {OFFER_ITEMS.map(item => (
                <div className="offer-item" key={item.title}>
                  <div className="offer-item__icon">{item.icon}</div>
                  <div>
                    <div className="offer-item__title">{item.title}</div>
                    <div className="offer-item__sub">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="offer-bonus">
              <div className="offer-bonus__tag">Bonus Included</div>
              <div className="offer-bonus__title">Exclusive Add-ons Worth ₹15,000</div>
              <ul className="offer-bonus__list">
                {BONUS_ITEMS.map(b => <li key={b}>{b}</li>)}
              </ul>
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button className="btn-primary" onClick={goCheckout} id="offer-cta" style={{ width: '100%' }}>
                  Get Full Access →
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                  One-time · No recurring fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="section testimonials" id="testimonials">
        <div className="container">
          <div className="section__head">
            <span className="section-label">Success Stories</span>
            <h2 className="section-title">Real Agents. <span>Real Deals.</span></h2>
            <p className="section-sub">Hear from members who closed deals through our pipeline.</p>
          </div>
          <div className="carousel" ref={carouselRef}>
            <div className="carousel__track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
              {TESTIMONIALS.map(t => (
                <div className="testimonial-card" key={t.name}>
                  <div className="testimonial-card__stars">{'★'.repeat(t.stars)}</div>
                  <p className="testimonial-card__quote">{t.quote}</p>
                  <img src={t.img} alt={t.name} className="testimonial-card__avatar" />
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              ))}
            </div>
            <div className="carousel__controls">
              <button className="carousel__btn" onClick={prevTestimonial} aria-label="Previous">←</button>
              <div className="carousel__dots">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    className={`carousel__dot ${i === activeTestimonial ? 'active' : ''}`}
                    onClick={() => { clearInterval(autoRef.current); setActiveTestimonial(i) }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button className="carousel__btn" onClick={nextTestimonial} aria-label="Next">→</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          COMPARISON
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="comparison">
        <div className="container">
          <div className="section__head">
            <span className="section-label">Why Aadai?</span>
            <h2 className="section-title">We vs <span>Everything Else</span></h2>
          </div>
          <div className="comparison-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Feature</th>
                  <th className="col-us">Aadai Pipeline</th>
                  <th>Portals (99acres, MagicBricks)</th>
                  <th>Cold Calling / Ads</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Buyer pre-verified',       '✓','✗','✗'],
                  ['Budget confirmed',          '✓','✗','✗'],
                  ['Direct contact access',     '✓','✗','✗'],
                  ['No monthly subscription',   '✓','✗','✓'],
                  ['Tamil Nadu focused',        '✓','✗','✗'],
                  ['Avg. close time',           '45 days','4–6 months','Unknown'],
                  ['Your commission split',     '100% yours','100% yours','100% yours'],
                ].map(([feat, ...vals]) => (
                  <tr key={feat}>
                    <td>{feat}</td>
                    {vals.map((v, i) => (
                      <td key={i}>
                        {v === '✓' ? <span className="check">✓</span>
                          : v === '✗' ? <span className="cross">✗</span>
                          : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PRICING
      ══════════════════════════════════════ */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section__head">
            <span className="section-label">Pricing</span>
            <h2 className="section-title">One Price. <span>Twelve Months.</span></h2>
            <p className="section-sub">No surprises. No recurring fees. No commissions taken from your deals.</p>
          </div>
          <div className="pricing-card">
            <div className="pricing-badge">🔥 Limited Time Offer</div>
            <div className="pricing-title">Direct Buyer Pipeline — Full Access</div>
            <div className="pricing-price-row">
              <div className="pricing-old">{fmt(ORIGINAL_PRICE)}</div>
              <div className="pricing-new">{fmt(SELLING_PRICE)}</div>
            </div>
            <div className="pricing-save">You save {fmt(ORIGINAL_PRICE - SELLING_PRICE)} ({saved}% off)</div>
            <ul className="pricing-features">
              {[
                '500+ verified buyer profiles across Tamil Nadu',
                'Private WhatsApp pipeline group (weekly updates)',
                'Searchable buyer directory — filter by budget, area, timeline',
                'Direct contact details — no gatekeepers',
                '1-on-1 onboarding strategy call',
                'Closing scripts in English & Tamil',
                'NRI buyer sub-group access',
                'Monthly market intelligence reports',
                '12 months full access',
              ].map(f => <li key={f}>{f}</li>)}
            </ul>
            <button className="btn-primary pricing-cta" onClick={goCheckout} id="pricing-cta">
              🚀 Get Instant Access — {fmt(SELLING_PRICE)}
            </button>
            <p className="pricing-note">✓ Secure payment via Razorpay &nbsp;·&nbsp; ✓ 90-day buyer guarantee</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="section section--alt" id="faq">
        <div className="container">
          <div className="section__head">
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Common <span>Questions</span></h2>
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
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <div className="footer__logo">Aadai <span>Growth</span> Partners</div>
              <p className="footer__desc">
                Tamil Nadu's most trusted direct buyer pipeline for real estate professionals.
                Stop chasing leads. Start closing deals.
              </p>
            </div>
            <div className="footer__links">
              <h4>Quick Links</h4>
              <a href="#how-it-works">How It Works</a>
              <a href="#offer">What You Get</a>
              <a href="#testimonials">Success Stories</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer__links">
              <h4>Contact</h4>
              <a href="mailto:aadaigrowthpartners@gmail.com">aadaigrowthpartners@gmail.com</a>
              <a href="#pricing">Get Access</a>
            </div>
          </div>
          <div className="footer__bottom">
            © {new Date().getFullYear()} Aadai Growth Partners. All rights reserved. &nbsp;·&nbsp; Tamil Nadu, India
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          STICKY BAR
      ══════════════════════════════════════ */}
      <div className={`sticky-bar ${stickyVisible ? 'visible' : ''}`} id="sticky-bar">
        <div className="sticky-bar__text">
          🔥 Limited spots left — <strong>{fmt(SELLING_PRICE)}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
            (was {fmt(ORIGINAL_PRICE)})
          </span>
        </div>
        <button className="btn-primary sticky-bar__cta" onClick={goCheckout} id="sticky-cta">
          Claim Your Spot →
        </button>
      </div>
    </>
  )
}
