// Promo code configuration — edit here to add / disable codes
// Push to GitHub → Netlify auto-deploys in ~60 seconds

export const ORIGINAL_PRICE      = 50000   // shown strikethrough
export const SELLING_PRICE       = 35000   // actual checkout price
export const PROMO_TIMER_MINUTES = 10      // countdown shown at checkout step 3

export const PROMO_CODES = [
  { code: 'AGP5SAVE',  discount: 5,  active: true },
  { code: 'AGP10VIP',  discount: 10, active: true },
  { code: 'AGP15PRO',  discount: 15, active: true },
  { code: 'AGP20PLUS', discount: 20, active: true },
  { code: 'AGP25MAX',  discount: 25, active: true },
  { code: 'TESTVENGAT',  discount: 99.99, active: true },
]