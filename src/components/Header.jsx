import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/header.css'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleCTA = () => {
    if (location.pathname === '/') {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/checkout')
    }
  }

  return (
    <header className="main-header" id="main-header">
      <div className="main-header__inner">
        {/* Logo */}
        <div className="main-header__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span style={{ color: '#1A1A1A' }}>Aadai </span>
          <span style={{ color: '#B8932A' }}>Growth </span>
          <span style={{ color: '#1A1A1A' }}>Partners</span>
        </div>

        {/* CTA Button — always visible on all screen sizes */}
        <button
          className="btn-primary main-header__cta"
          id="main-header-cta"
          onClick={handleCTA}
        >
          <span className="agp-cta-full">Secure My Spot →</span>
          <span className="agp-cta-short">Secure Spot</span>
        </button>
      </div>
    </header>
  )
}
