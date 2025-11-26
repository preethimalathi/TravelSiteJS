const API_BASE = 'http://localhost:8080/api';
let currentUser = null;
let authToken = localStorage.getItem('token');

// Show toast notification
function showToast(message, type = 'info') {
    const toast = new bootstrap.Toast(document.getElementById('liveToast'));
    const toastBody = document.getElementById('toast-message');
    
    toastBody.textContent = message;
    toastBody.className = 'toast-body';
    if (type === 'error') {
        toastBody.style.color = '#dc3545';
    } else if (type === 'success') {
        toastBody.style.color = '#28a745';
    }
    
    toast.show();
}

// Show/hide pages
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        page.style.display = 'block';
        
        // Load page content
        switch(pageId) {
            case 'login':
                loadLoginPage();
                break;
            case 'register':
                loadRegisterPage();
                break;
            case 'products':
                loadProductsPage();
                break;
            case 'cart':
                loadCartPage();
                break;
            case 'checkout':
                loadCheckoutPage();
                break;
            case 'orders':
                loadOrdersPage();
                break;
            case 'admin':
                loadAdminPage();
                break;
            case 'home':
                updateHomePage();
                break;
        }
    }
}

// Update navigation based on auth status
function updateNavigation() {
    const authNav = document.getElementById('auth-nav');
    const userNav = document.getElementById('user-nav');
    const cartNav = document.getElementById('cart-nav');
    const ordersNav = document.getElementById('orders-nav');
    const adminNav = document.getElementById('admin-nav');
    const homeButtons = document.getElementById('home-buttons');

    if (currentUser) {
        authNav.style.display = 'none';
        userNav.style.display = 'block';
        cartNav.style.display = 'block';
        ordersNav.style.display = 'block';
        
        document.getElementById('user-greeting').textContent = `Welcome, ${currentUser.firstName}!`;
        
        // Show admin nav if user is admin
        const isAdmin = currentUser.roles.some(role => role.name === 'ROLE_ADMIN');
        adminNav.style.display = isAdmin ? 'block' : 'none';
        
        if (homeButtons) {
            homeButtons.style.display = 'none';
        }
    } else {
        authNav.style.display = 'block';
        userNav.style.display = 'none';
        cartNav.style.display = 'none';
        ordersNav.style.display = 'none';
        adminNav.style.display = 'none';
        
        if (homeButtons) {
            homeButtons.style.display = 'block';
        }
    }
}

// Update home page based on auth status
function updateHomePage() {
    const homeButtons = document.getElementById('home-buttons');
    if (currentUser && homeButtons) {
        homeButtons.style.display = 'none';
    } else if (homeButtons) {
        homeButtons.style.display = 'block';
    }
}

// API request helper
async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE}${url}`, {
            headers,
            ...options
        });

        if (response.status === 401) {
            // Token expired or invalid
            logout();
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        // Check if response has content
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0') {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Initialize application
function initApp() {
    // Check if user is logged in
    if (authToken) {
        fetchUserProfile();
    } else {
        updateNavigation();
        showPage('home');
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);