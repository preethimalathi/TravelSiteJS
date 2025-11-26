let orders = [];

// Load orders page
function loadOrdersPage() {
    const ordersPage = document.getElementById('orders-page');
    ordersPage.innerHTML = `
        <h2 class="mb-4">My Orders</h2>
        <div id="orders-container">
            <div class="loading">Loading orders...</div>
        </div>
    `;

    fetchOrders();
}

// Fetch orders
async function fetchOrders() {
    try {
        orders = await apiRequest('/orders');
        renderOrders();
    } catch (error) {
        document.getElementById('orders-container').innerHTML = `
            <div class="error-message">Failed to load orders: ${error.message}</div>
        `;
    }
}

// Render orders
function renderOrders() {
    const container = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <h5>No orders found</h5>
                    <p>Start shopping to see your orders here!</p>
                    <button class="btn btn-primary" onclick="showPage('products')">
                        Browse Products
                    </button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="card order-card mb-4">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <span class="badge status-badge bg-${getStatusColor(order.status)} ms-2">
                            ${order.status}
                        </span>
                    </div>
                    <div>
                        <small class="text-muted">
                            ${new Date(order.orderDate).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>$${item.productPrice}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.productPrice * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="d-flex justify-content-between align-items-center">
                    <strong>Total: $${order.totalPrice.toFixed(2)}</strong>
                    ${order.status === 'PENDING' ? `
                        <button class="btn btn-outline-danger btn-sm" onclick="cancelOrder(${order.id})">
                            Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Get status color for badge
function getStatusColor(status) {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'PAID': return 'success';
        case 'SHIPPED': return 'info';
        case 'DELIVERED': return 'primary';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    try {
        await apiRequest(`/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        showToast('Order cancelled successfully', 'success');
        fetchOrders();
    } catch (error) {
        showToast(error.message || 'Failed to cancel order', 'error');
    }
}
