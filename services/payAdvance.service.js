/* ============================================================
   PAY ADVANCE SERVICE — services/payAdvance.service.js
   Aadai Growth Partners
   ============================================================
   This service handles Razorpay integration for advance plans.
   Import this in payAdvance.html via:
   <script src="services/payAdvance.service.js"></script>
   ============================================================ */

/* --- CONFIGURATION (fill your keys here) ---
   Pull from your existing config or replace directly:        */

const PAY_ADVANCE_CONFIG = {
  key: window.RAZORPAY_KEY_ID || "rzp_live_XXXXXXXXXXXXXXX",
  currency: "INR",
  company: "Aadai Growth Partners",
  description: "Advance Payment — Direct Buyer Pipeline",
  theme: { color: "#F5A623" },

  plans: {
    1: { name: "Basic Advance",    amount: 399900,  label: "₹3,999"  },
    2: { name: "Standard Advance", amount: 799900,  label: "₹7,999"  },
    3: { name: "Premium Advance",  amount: 999900,  label: "₹9,999"  }
  }
};

/* --- MAIN FUNCTION ---
   Call this on Pay button click.
   planId: 1, 2, or 3
   userData: { name, email, mobile } — pass from localStorage  */

function initiateAdvancePayment(planId, userData) {
  const plan = PAY_ADVANCE_CONFIG.plans[planId];
  if (!plan) { alert("Please select a plan."); return; }

  const options = {
    key:         PAY_ADVANCE_CONFIG.key,
    amount:      plan.amount,
    currency:    PAY_ADVANCE_CONFIG.currency,
    name:        PAY_ADVANCE_CONFIG.company,
    description: plan.name + " — " + PAY_ADVANCE_CONFIG.description,
    prefill: {
      name:    userData?.name   || "",
      email:   userData?.email  || "",
      contact: userData?.mobile || ""
    },
    theme: PAY_ADVANCE_CONFIG.theme,

    handler: function(response) {
      // SUCCESS — redirect to receipt
      const params = new URLSearchParams({
        plan:   planId,
        amount: plan.amount / 100,
        name:   userData?.name || "",
        txnid:  response.razorpay_payment_id
      });
      window.location.href = "receipt.html?" + params.toString();
    },

    modal: {
      ondismiss: function() {
        console.log("Advance payment dismissed by user.");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
