(function () {
  const BASE_PRICE = 10;

  function getExtraInput() {
    return document.getElementById('extraAmount');
  }

  function getTotalElement() {
    return document.getElementById('totalAmount');
  }

  function getUnlockButton() {
    return document.getElementById('unlockButton');
  }

  function getPaypalContainer() {
    return document.getElementById('paypalContainer');
  }

  function getAlreadyPurchasedBanner() {
    return document.getElementById('alreadyPurchased');
  }

  function getSignInMessage() {
    return document.getElementById('purchaseSignInMessage');
  }

  function getTotalAmount() {
    const extraInput = getExtraInput();
    const extra = parseFloat(extraInput?.value) || 0;
    const total = BASE_PRICE + Math.max(0, extra);
    return total.toFixed(2);
  }

  function updateTotalDisplay() {
    const target = getTotalElement();
    if (target) {
      target.innerText = getTotalAmount();
    }
  }

  function renderPayPalButton(options = {}) {
    if (typeof paypal === 'undefined' || !paypal?.Buttons) {
      console.warn('PayPal SDK is not available.');
      return;
    }

    const buttonContainer = document.getElementById('paypal-button-container');
    if (!buttonContainer) {
      return;
    }

    buttonContainer.innerHTML = '';

    paypal.Buttons({
      createOrder: function (_data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: getTotalAmount()
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          if (typeof options.onApprove === 'function') {
            try {
              options.onApprove({
                details,
                data,
                total: getTotalAmount()
              });
            } catch (error) {
              console.error('CaveGrok onApprove handler failed', error);
            }
          }
        });
      },
      onError: function (error) {
        console.error('PayPal checkout error', error);
        if (typeof options.onError === 'function') {
          options.onError(error);
        }
      }
    }).render('#paypal-button-container');
  }

  function setup(options = {}) {
    updateTotalDisplay();

    const extraInput = getExtraInput();
    if (extraInput) {
      extraInput.addEventListener('input', updateTotalDisplay);
    }

    const unlockButton = getUnlockButton();
    if (unlockButton) {
      unlockButton.addEventListener('click', () => {
        unlockButton.classList.add('hidden');
        const container = getPaypalContainer();
        if (container) {
          container.classList.remove('hidden');
        }
        renderPayPalButton(options);
      });
    }
  }

  function resetUi() {
    const unlockButton = getUnlockButton();
    if (unlockButton) {
      unlockButton.classList.remove('hidden');
      unlockButton.disabled = false;
    }

    const container = getPaypalContainer();
    if (container) {
      container.classList.add('hidden');
    }

    const banner = getAlreadyPurchasedBanner();
    if (banner) {
      banner.style.display = 'none';
    }

    const signIn = getSignInMessage();
    if (signIn) {
      signIn.classList.add('hidden');
    }
  }

  function showPurchasedBanner() {
    const banner = getAlreadyPurchasedBanner();
    if (banner) {
      banner.style.display = 'block';
    }
  }

  function showSignInMessage() {
    const message = getSignInMessage();
    const unlockButton = getUnlockButton();
    const container = getPaypalContainer();

    if (message) {
      message.classList.remove('hidden');
    }
    if (unlockButton) {
      unlockButton.classList.add('hidden');
      unlockButton.disabled = true;
    }
    if (container) {
      container.classList.add('hidden');
    }
  }

  window.CaveGrokPayPal = {
    setup,
    render: renderPayPalButton,
    reset: resetUi,
    updateTotalDisplay,
    getTotalAmount,
    showPurchasedBanner,
    showSignInMessage
  };
})();
