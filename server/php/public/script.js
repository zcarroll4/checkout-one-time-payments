// The max and min number of services a customer can purchase
var MIN_SERVICES = 1;
var MAX_SERVICES = 3;

var basicPhotoButton = document.getElementById("basic-photo-button");
document
  .getElementById("quantity-input")
  .addEventListener("change", function (evt) {
    // Ensure customers only buy between 1 and 10 photos
    if (evt.target.value < MIN_SERVICES) {
      evt.target.value = MIN_SERVICES;
    }
    if (evt.target.value > MAX_SERVICES) {
      evt.target.value = MAX_SERVICES;
    }
  });

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var updateQuantity = function (evt) {
  if (evt && evt.type === "keypress" && evt.keyCode !== 13) {
    return;
  }

  var isAdding = evt && evt.target.id === "add";
  var inputEl = document.getElementById("quantity-input");
  var currentQuantity = parseInt(inputEl.value);

  document.getElementById("add").disabled = false;
  document.getElementById("subtract").disabled = false;

  // Calculate new quantity
  var quantity = evt
    ? isAdding
      ? currentQuantity + 1
      : currentQuantity - 1
    : currentQuantity;
  // Update number input with new value.
  inputEl.value = quantity;
  // Calculate the total amount and format it with currency symbol.
  var amount = config.unitAmount;
  var numberFormat = new Intl.NumberFormat(i18next.language, {
    style: "currency",
    currency: config.currency,
    currencyDisplay: "symbol",
  });
  var parts = numberFormat.formatToParts(amount);
  var zeroDecimalCurrency = true;
  for (var part of parts) {
    if (part.type === "decimal") {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  var total = (quantity * amount).toFixed(2);
  var formattedTotal = numberFormat.format(total);

  document
    .getElementById("submit")
    .setAttribute("i18n-options", `{ "total": "${formattedTotal}" }`);
  updateContent("button.submit");


  var name = config.productName;
  document.getElementById("name").innerHTML = name;

  // Disable the button if the customers hits the max or min
  if (quantity === MIN_SERVICES) {
    document.getElementById("subtract").disabled = true;
  }
  if (quantity === MAX_SERVICES) {
    document.getElementById("add").disabled = true;
  }
};

/* Attach method */
Array.from(document.getElementsByClassName("increment-btn")).forEach(
  (element) => {
    element.addEventListener("click", updateQuantity);
  }
);

// Create a Checkout Session with the selected quantity
var createCheckoutSession = function (stripe) {
  var inputEl = document.getElementById("quantity-input");
  var quantity = parseInt(inputEl.value);

  return fetch("/create-checkout-session.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: quantity,
    }),
  }).then(function (result) {
    return result.json();
  });
};

// Handle any errors returned from Checkout
var handleResult = function (result) {
  if (result.error) {
    var displayError = document.getElementById("error-message");
    displayError.textContent = result.error.message;
  }
};

/* Get your Stripe publishable key to initialize Stripe.js */
fetch("/config.php")
  .then(function (result) {
    return result.json();
  })
  .then(function (json) {
    window.config = json;
    var stripe = Stripe(config.publicKey);
    updateQuantity();
    // Setup event handler to create a Checkout Session on submit
    document.querySelector("#submit").addEventListener("click", function (evt) {
      createCheckoutSession().then(function (data) {
        stripe
          .redirectToCheckout({
            sessionId: data.sessionId,
          })
          .then(handleResult);
      });
    });
  });
