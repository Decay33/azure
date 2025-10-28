// paypal.js

// Returns the total order amount as a string (base $10 plus any extra amount)
function getTotalAmount() {
  const extra = parseFloat(document.getElementById('extraAmount').value) || 0;
  return (10 + extra).toFixed(2);
}

// Update the displayed total on the purchase panel.
function updateTotalDisplay() {
  document.getElementById('totalAmount').innerText = getTotalAmount();
}

// Render the PayPal button into the container.
function renderPayPalButton() {
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: getTotalAmount()
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        // Mark the hot pink ship as unlocked in localStorage.
        localStorage.setItem('hotPinkShipUnlocked', 'true');
        alert('Transaction completed by ' + details.payer.name.given_name + '! Your HOT Pink ship is now unlocked.');
        // Option 1: Refresh the page so that the game uses the unlocked ship and hides purchase UI.
        location.reload();
        // Option 2: Alternatively, you could update the UI without a full refresh:
        // updateShipPreview();
        // document.getElementById('unlockButton').style.display = 'none';
        // document.getElementById('paypalContainer').style.display = 'none';
        // document.getElementById('alreadyPurchased').style.display = 'block';
      });
    },
    onError: function(err) {
      console.error('PayPal Checkout error', err);
      alert('There was an error processing the transaction.');
    }
  }).render('#paypal-button-container');
}

// Function to draw the ship preview on the shipCanvas in hot pink.
function updateShipPreview() {
  const canvas = document.getElementById('shipCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'hotpink';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 10);
  ctx.lineTo(10, canvas.height - 10);
  ctx.lineTo(canvas.width - 10, canvas.height - 10);
  ctx.closePath();
  ctx.fill();
}

// On page load, show the hot pink ship preview.
window.addEventListener('load', function(){
  updateShipPreview();
  
  // Set up the unlock button to show the PayPal UI when clicked.
  const unlockButton = document.getElementById('unlockButton');
  unlockButton.addEventListener('click', function(){
    // Hide the unlock button.
    unlockButton.style.display = 'none';
    // Reveal the PayPal container.
    document.getElementById('paypalContainer').style.display = 'block';
    // Render the PayPal button.
    renderPayPalButton();
  });
  
  // Update the total amount whenever the extra amount input changes.
  const extraInput = document.getElementById('extraAmount');
  extraInput.addEventListener('input', updateTotalDisplay);
});
