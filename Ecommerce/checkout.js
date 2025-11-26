// Load checkout page
function loadCheckoutPage() {
    const checkoutPage = document.getElementById('checkout-page');
    checkoutPage.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h3>Checkout</h3>
                    </div>
                    <div class="card-body">
                        <div id="checkout-error" class="error-message" style="display: none;"></div>
                        <form id="checkout-form">
                            <div class="form-group">
                                <label>Shipping Address</label>
                                <textarea class="form-control" name="shippingAddress" rows="3" required></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Payment Method</label>
                                <select class="form-select" name="paymentMethod" onchange="togglePaymentFields(this.value)">
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="DEBIT_CARD">Debit Card</option>
                                    <option value="PAYPAL">PayPal</option>
                                </select>
                            </div>
                            
                            <div id="card-fields">
                                <div class="form-group">
                                    <label>Card Number</label>
                                    <input type="text" class="form-control" name="cardNumber" placeholder="1234 5678 9012 3456">
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label>Card Holder Name</label>
                                            <input type="text" class="form-control" name="cardHolderName">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label>Expiry Date</label>
                                            <input type="text" class="form-control" name="expiryDate" placeholder="MM/YY">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label>CVV</label>
                                            <input type="text" class="form-control" name="cvv" placeholder="123">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-lg w-100">Place Order</button>
 


                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
}

// Toggle payment fields based on payment method
function togglePaymentFields(paymentMethod) {
    const cardFields = document.getElementById('card-fields');
    const cardInputs = cardFields.querySelectorAll('input');
    
    if (paymentMethod === 'PAYPAL') {
        cardFields.style.display = 'none';
        cardInputs.forEach(input => input.required = false);
    } else {
        cardFields.style.display = 'block';
        cardInputs.forEach(input => input.required = true);
    }
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errorDiv = document.getElementById('checkout-error');
    errorDiv.style.display = 'none';

    try {
        // Create order first
        const orderResponse = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({
                shippingAddress: data.shippingAddress,
                paymentMethod: data.paymentMethod
            })
        });

        const orderId = orderResponse.id;

        // Process payment
        const paymentResponse = await apiRequest(`/payments/order/${orderId}`, {
            method: 'POST',
            body: JSON.stringify({
                paymentMethod: data.paymentMethod,
                cardNumber: data.cardNumber,
                cardHolderName: data.cardHolderName,
                expiryDate: data.expiryDate,
                cvv: data.cvv
            })
        });

        if (paymentResponse.status === 'SUCCESS') {
            showToast('Order placed successfully!', 'success');
            showPage('orders');
        } else {
            throw new Error(paymentResponse.paymentGatewayResponse || 'Payment failed');
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Checkout failed';
        errorDiv.style.display = 'block';
    }
}
