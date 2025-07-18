// This is your test publishable API key.
const stripe = Stripe("pk_test_51RPJZCQ5edmpQrvmR5J1WWDWyQG2Zk6cNjlraO66VB6aStOvtevDMMRBtAG31rtKIlPwEjwVTjWcJBsBKsQj0KMD00BRkH3U0C");

let checkout;
initialize();
const emailInput = document.getElementById("email");
const emailErrors = document.getElementById("email-errors");

const validateEmail = async (email) => {
  const updateResult = await checkout.updateEmail(email);
  const isValid = updateResult.type !== "error";

  return { isValid, message: !isValid ? updateResult.error.message : null };
};

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a Checkout Session and captures the client secret
async function initialize() {
  const promise = fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((r) => r.json())
    .then((r) => r.clientSecret);

  const appearance = {
    theme: 'stripe',
  };
  checkout = await stripe.initCheckout({
    fetchClientSecret: () => promise,
    elementsOptions: { appearance },
  })

  checkout.on('change', (session) => {
    // Handle changes to the checkout session
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const total = document.getElementById('total');
  
    checkout.on('change', (session) => {
      subtotal.textContent = `Subtotal: ${session.total.subtotal.amount}`;
      shipping.textContent = `Shipping: ${session.total.shippingRate.amount}`;
      total.textContent = `Total: ${session.total.total.amount}`;
    })
  });

  document.querySelector("#button-text").textContent = `Pay ${
    checkout.session().total.total.amount
  } now`;
  emailInput.addEventListener("input", () => {
    // Clear any validation errors
    emailErrors.textContent = "";
    emailInput.classList.remove("error");
  });

  emailInput.addEventListener("blur", async () => {
    const newEmail = emailInput.value;
    if (!newEmail) {
      return;
    }

    const { isValid, message } = await validateEmail(newEmail);
    if (!isValid) {
      emailInput.classList.add("error");
      emailErrors.textContent = message;
    }
  });

  const paymentElement = checkout.createPaymentElement();
  paymentElement.mount("#payment-element");
  const billingAddressElement = checkout.createBillingAddressElement();
  billingAddressElement.mount("#billing-address-element");
  const shippingAddressElement = checkout.createShippingAddressElement();
  shippingAddressElement.mount('#shipping-address');
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const email = document.getElementById("email").value;
  const { isValid, message } = await validateEmail(email);
  if (!isValid) {
    emailInput.classList.add("error");
    emailErrors.textContent = message;
    showMessage(message);
    setLoading(false);
    return;
  }

  const { error } = await checkout.confirm();

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  showMessage(error.message);

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}