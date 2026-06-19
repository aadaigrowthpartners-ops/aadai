const PAY_ADVANCE_CONFIG = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_XXXXXXXXXXXXXXX",
  currency: "INR",
  company: "Aadai Growth Partners",
  description: "Advance Payment — Direct Buyer Pipeline",
  theme: { color: "#F5A623" },
  plans: {
    1: { name: "Basic Advance",    amount: 399900,  label: "₹3,999",  remaining: 31001 },
    2: { name: "Standard Advance", amount: 799900,  label: "₹7,999",  remaining: 27001 },
    3: { name: "Premium Advance",  amount: 999900,  label: "₹9,999",  remaining: 25001 }
  }
};

export function getAdvancePlans() {
  return PAY_ADVANCE_CONFIG.plans;
}

export function getPlanById(planId) {
  return PAY_ADVANCE_CONFIG.plans[planId] || null;
}

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = resolve;
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.body.appendChild(script);
  });
}

export async function initiateAdvancePayment(planId, userData) {
  try {
    await loadRazorpayScript();
  } catch (err) {
    throw new Error("Razorpay SDK not loaded");
  }

  return new Promise((resolve, reject) => {
    const plan = PAY_ADVANCE_CONFIG.plans[planId];
    if (!plan) { reject(new Error("Invalid plan selected")); return; }

    const options = {
      key:         PAY_ADVANCE_CONFIG.key,
      amount:      plan.amount,
      currency:    PAY_ADVANCE_CONFIG.currency,
      name:        PAY_ADVANCE_CONFIG.company,
      description: plan.name + " — " + PAY_ADVANCE_CONFIG.description,
      prefill: {
        name:    userData?.name   || "",
        email:   userData?.email  || "",
        contact: userData?.mobile || userData?.phone || ""
      },
      theme: PAY_ADVANCE_CONFIG.theme,
      handler: function(response) {
        resolve({
          planId,
          planName:  plan.name,
          amount:    plan.amount / 100,
          remaining: plan.remaining,
          paymentId: response.razorpay_payment_id
        });
      },
      modal: {
        ondismiss: () => reject(new Error("Payment dismissed by user"))
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  });
}
