import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CheckoutPage from './pages/CheckoutPage'
import ThankYouPage from './pages/ThankYouPage'
import PayAdvancePage from './pages/PayAdvancePage'
import './styles/global.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/checkout"   element={<CheckoutPage />} />
        <Route path="/thank-you"  element={<ThankYouPage />} />
        <Route path="/pay-advance" element={<PayAdvancePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
