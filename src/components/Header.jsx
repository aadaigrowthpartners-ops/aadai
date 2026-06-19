import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/header.css'

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'About',           href: '/#offer' },
  { label: 'Success Stories', href: '/#testimonials' },
  { label: 'Contact',         href: 'mailto:aadaigrowthpartners@gmail.com' },
]

export default function Header() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setDrawerOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="main-header" id="main-header">
      <div className="main-header__inner">
        {/* Logo */}
        <div className="main-header__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Aadai <span>Growth</span> Partners
        </div>

        {/* Desktop Nav — hidden on mobile via responsive.css */}
        <nav aria-label="Site navigation">
          <ul className="main-header__nav">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA Button — always visible, text changes on mobile */}
        <button
          className="btn-primary main-header__cta"
          id="main-header-cta"
          onClick={() => navigate('/checkout')}
        >
          <span className="agp-cta-full">Book Strategy Call →</span>
          <span className="agp-cta-short">Book Call</span>
        </button>

        {/* Hamburger — hidden on mobile per spec (CTA is enough) */}
        <button
          className={`main-header__burger ${drawerOpen ? 'open' : ''}`}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(p => !p)}
          id="burger-btn"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Drawer — only shown if hamburger is visible */}
      <div className={`main-header__drawer ${drawerOpen ? 'open' : ''}`} id="mobile-drawer">
        {NAV_LINKS.map(({ label, href }) => (
          <a key={label} href={href} onClick={() => setDrawerOpen(false)}>{label}</a>
        ))}
        <button
          className="btn-primary"
          onClick={() => { setDrawerOpen(false); navigate('/checkout') }}
          id="drawer-cta"
        >
          Book Strategy Call →
        </button>
      </div>
    </header>
  )
}
