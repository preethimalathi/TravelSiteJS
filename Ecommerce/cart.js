let cartItems = [];

// Load cart page
function loadCartPage() {
    const cartPage = document.getElementById('cart-page');
    cartPage.innerHTML = `
        <h2 class="mb-4">Shopping Cart</h2>
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body" id="cart-items-container">
                        <div class="loading">Loading cart...</div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h4>Order Summary</h4>
                    </div>
                    <div class="card-body">
                        <div id="cart-summary">
                            <p>Total Items: <span id="total-items">0</span></p>
                            <p>Total Price: $<span id="total-price">0.00</span></p>
                            <button class="btn btn-primary w-100" onclick="proceedToCheckout()" disabled>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    fetchCartItems();
}

// Fetch cart items
async function fetchCartItems() {
    try {
        cartItems = await apiRequest('/cart');
        renderCartItems();
        updateCartSummary();
    } catch (error) {
        document.getElementById('cart-items-container').innerHTML = `
            <div class="error-message">Failed to load cart: ${error.message}</div>
        `;
    }
}

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    
    if (cartItems.length === 0) {
        container.innerHTML = '<p class="text-center">Your cart is empty</p>';
        return;
    }

    container.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-md-4">
                    <h6>${item.product.name}</h6>
                </div>
                <div class="col-md-2">
                    <span>$${item.product.price}</span>
                </div>
                <div class="col-md-3">
                    <select class="form-select" onchange="updateCartItemQuantity(${item.id}, this.value)">
                        ${Array.from({length: Math.min(10, item.product.quantity)}, (_, i) => `
                            <option value="${i + 1}" ${i + 1 === item.quantity ? 'selected' : ''}>
                                ${i + 1}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <span>$${item.price.toFixed(2)}</span>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary() {
    const totalItems = cartItems.length;
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
    
    const checkoutBtn = document.querySelector('#cart-summary button');
    checkoutBtn.disabled = totalItems === 0;
}

// Update cart item quantity
async function updateCartItemQuantity(cartItemId, quantity) {
    try {
        await apiRequest(`/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: parseInt(quantity) })
        });
        
        fetchCartItems();
        updateCartCount();
        showToast('Cart updated', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to update cart', 'error');
    }
}

// Remove cart item
async function removeCartItem(cartItemId) {
    try {
        await apiRequest(`/cart/${cartItemId}`, {
            method: 'DELETE'
        });
        
        fetchCartItems();
        updateCartCount();
        showToast('Item removed from cart', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to remove item', 'error');
    }
}

// Clear cart
async function clearCart() {
    try {
        await apiRequest('/cart', {
            method: 'DELETE'
        });
        
        fetchCartItems();
        updateCartCount();
        showToast('Cart cleared', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to clear cart', 'error');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartItems.length > 0) {
        showPage('checkout');
    }
}
