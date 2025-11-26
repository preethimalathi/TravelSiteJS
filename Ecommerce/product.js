let products = [];
let filteredProducts = [];
let categories = [];

// Load products page
function loadProductsPage() {
    const productsPage = document.getElementById('products-page');
    productsPage.innerHTML = `
        <div class="mb-4">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <input type="text" class="form-control" id="search-input" placeholder="Search products..." oninput="filterProducts()">
                </div>
                <div class="col-md-6 mb-3">
                    <select class="form-select" id="category-select" onchange="filterProducts()">
                        <option value="">All Categories</option>
                    </select>
                </div>
            </div>
        </div>
        <div id="products-container" class="row">
            <div class="loading">Loading products...</div>
        </div>
    `;

    fetchProducts();
}

// Fetch all products
async function fetchProducts() {
    try {
        products = await apiRequest('/products');
        categories = [...new Set(products.map(p => p.category))];
        
        // Populate category dropdown
        const categorySelect = document.getElementById('category-select');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        filteredProducts = products;
        renderProducts();
    } catch (error) {
        document.getElementById('products-container').innerHTML = `
            <div class="error-message">Failed to load products: ${error.message}</div>
        `;
    }
}

// Filter products based on search and category
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-select').value;

    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    renderProducts();
}

// Render products
function renderProducts() {
    const container = document.getElementById('products-container');
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">No products found</div>';
        return;
    }

    container.innerHTML = filteredProducts.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-card">
                ${product.image ? `
                    <img src="/api/products/${product.id}/image" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.style.display='none'">
                ` : ''}
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description.substring(0, 100)}...</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>$${product.price}</strong>
                            <span class="text-muted ms-2">Stock: ${product.quantity}</span>
                        </div>
                        ${currentUser ? `
                            <button class="btn btn-primary btn-sm" 
                                    onclick="addToCart(${product.id})"
                                    ${product.quantity === 0 ? 'disabled' : ''}>
                                ${product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        ` : `
                            <button class="btn btn-outline-primary btn-sm" onclick="showPage('login')">
                                Login to Buy
                            </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to cart
async function addToCart(productId, quantity = 1) {
    try {
        await apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
        
        updateCartCount();
        showToast('Product added to cart!', 'success');
    } catch (error) {
        showToast(error.message || 'Failed to add product to cart', 'error');
    }
}

// Update cart count in navigation
async function updateCartCount() {
    try {
        const cartItems = await apiRequest('/cart');
        document.getElementById('cart-count').textContent = cartItems.length;
    } catch (error) {
        document.getElementById('cart-count').textContent = '0';
    }
}
