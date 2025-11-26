let adminProducts = [];
let adminOrders = [];
let adminUsers = [];
let currentAdminTab = 'products';

// Load admin page
function loadAdminPage() {
    const adminPage = document.getElementById('admin-page');
    adminPage.innerHTML = `
        <h2 class="mb-4">Admin Dashboard</h2>
        
        <ul class="nav nav-tabs" id="adminTabs">
            <li class="nav-item">
                <button class="nav-link active" onclick="switchAdminTab('products')">Products</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" onclick="switchAdminTab('orders')">Orders</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" onclick="switchAdminTab('users')">Users</button>
            </li>
        </ul>
        
        <div id="admin-content" class="admin-tab">
            <div class="loading">Loading...</div>
        </div>
        
        <!-- Product Modal -->
        <div class="modal fade" id="productModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalTitle">Add Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="productModalBody">
                        <!-- Product form will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    switchAdminTab('products');
}

// Switch admin tab
function switchAdminTab(tab) {
    currentAdminTab = tab;
    
    // Update active tab
    document.querySelectorAll('#adminTabs .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load tab content
    const adminContent = document.getElementById('admin-content');
    
    switch (tab) {
        case 'products':
            loadProductsTab();
            break;
        case 'orders':
            loadOrdersTab();
            break;
        case 'users':
            loadUsersTab();
            break;
    }
}

// Load products tab
async function loadProductsTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Product Management</h4>
            <button class="btn btn-primary" onclick="showProductModal()">
                <i class="bi bi-plus"></i> Add Product
            </button>
        </div>
        <div id="products-table">
            <div class="loading">Loading products...</div>
        </div>
    `;

    try {
        adminProducts = await apiRequest('/products');
        renderProductsTable();
    } catch (error) {
        adminContent.innerHTML = `
            <div class="error-message">Failed to load products: ${error.message}</div>
        `;
    }
}

// Render products table
function renderProductsTable() {
    const table = document.getElementById('products-table');
    
    if (adminProducts.length === 0) {
        table.innerHTML = '<p>No products found</p>';
        return;
    }

    table.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${adminProducts.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>$${product.price}</td>
                        <td>${product.quantity}</td>
                        <td>${product.category}</td>
                        <td>
                            <span class="badge ${product.active ? 'bg-success' : 'bg-danger'}">
                                ${product.active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-outline-primary btn-sm me-2" 
                                    onclick="editProduct(${product.id})">
                                Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm" 
                                    onclick="deleteProduct(${product.id})">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Show product modal
function showProductModal(product = null) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalTitle');
    const modalBody = document.getElementById('productModalBody');
    
    modalTitle.textContent = product ? 'Edit Product' : 'Add Product';
    
    modalBody.innerHTML = `
        <form id="productForm" enctype="multipart/form-data">
            <input type="hidden" name="id" value="${product ? product.id : ''}">
            <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" name="name" value="${product ? product.name : ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="3">${product ? product.description : ''}</textarea>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Price</label>
                    <input type="number" step="0.01" class="form-control" name="price" value="${product ? product.price : ''}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" name="quantity" value="${product ? product.quantity : ''}" required>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Category</label>
                    <input type="text" class="form-control" name="category" value="${product ? product.category : ''}" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Brand</label>
                    <input type="text" class="form-control" name="brand" value="${product ? product.brand : ''}">
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Product Image</label>
                <input type="file" class="form-control" name="image" accept="image/*">
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" name="active" id="activeCheck" ${product ? (product.active ? 'checked' : '') : 'checked'}>
                <label class="form-check-label" for="activeCheck">Active</label>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Product</button>
            </div>
        </form>
    `;

    document.getElementById('productForm').addEventListener('submit', (e) => handleProductSubmit(e, modal));
    modal.show();
}

// Handle product form submission
async function handleProductSubmit(e, modal) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        if (formData.get('id')) {
            // Edit existing product
            await apiRequest(`/products/${formData.get('id')}`, {
                method: 'PUT',
                body: formData
            });
            showToast('Product updated successfully', 'success');
        } else {
            // Add new product
            await apiRequest('/products', {
                method: 'POST',
                body: formData
            });
            showToast('Product added successfully', 'success');
        }
        
        modal.hide();
        loadProductsTab();
    } catch (error) {
        showToast(error.message || 'Failed to save product', 'error');
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const product = adminProducts.find(p => p.id === productId);
        if (product) {
            showProductModal(product);
        }
    } catch (error) {
        showToast('Failed to load product details', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await apiRequest(`/products/${productId}`, {
            method: 'DELETE'
        });
        
        showToast('Product deleted successfully', 'success');
        loadProductsTab();
    } catch (error) {
        showToast(error.message || 'Failed to delete product', 'error');
    }
}

// Load orders tab
async function loadOrdersTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
        <h4 class="mb-3">Order Management</h4>
        <div id="orders-table">
            <div class="loading">Loading orders...</div>
        </div>
    `;

    try {
        adminOrders = await apiRequest('/orders/all');
        renderOrdersTable();
    } catch (error) {
        adminContent.innerHTML = `
            <div class="error-message">Failed to load orders: ${error.message}</div>
        `;
    }
}

// Render orders table
function renderOrdersTable() {
    const table = document.getElementById('orders-table');
    
    if (adminOrders.length === 0) {
        table.innerHTML = '<p>No orders found</p>';
        return;
    }

    table.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${adminOrders.map(order => `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${order.user.username}</td>
                        <td>$${order.totalPrice}</td>
                        <td>
                            <select class="form-select form-select-sm" onchange="updateOrderStatus(${order.id}, this.value)">
                                <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                                <option value="PAID" ${order.status === 'PAID' ? 'selected' : ''}>Paid</option>
                                <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                                <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                                <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-outline-info btn-sm">View Details</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        showToast('Order status updated', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to update order status', 'error');
    }
}

// Load users tab
async function loadUsersTab() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
        <h4 class="mb-3">User Management</h4>
        <div id="users-table">
            <div class="loading">Loading users...</div>
        </div>
    `;

    try {
        adminUsers = await apiRequest('/admin/users');
        renderUsersTable();
    } catch (error) {
        adminContent.innerHTML = `
            <div class="error-message">Failed to load users: ${error.message}</div>
        `;
    }
}

// Render users table
function renderUsersTable() {
    const table = document.getElementById('users-table');
    
    if (adminUsers.length === 0) {
        table.innerHTML = '<p>No users found</p>';
        return;
    }

    table.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Roles</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${adminUsers.map(user => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.firstName} ${user.lastName}</td>
                        <td>
                            ${user.roles.map(role => `
                                <span class="badge bg-secondary me-1">${role.name}</span>
                            `).join('')}
                        </td>
                        <td>
                            <span class="badge bg-success">Active</span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
