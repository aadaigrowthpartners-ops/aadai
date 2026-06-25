// Promo code configuration — edit here to add / disable codes
// Push to GitHub → Netlify auto-deploys in ~60 seconds

export const ORIGINAL_PRICE      = 50000   // shown strikethrough
export const SELLING_PRICE       = 35000   // actual checkout price
export const PROMO_TIMER_MINUTES = 10      // countdown shown at checkout step 3

export const PROMO_CODES = [
  { code: 'AGPFOUND3',  discount: 25, active: true },
]