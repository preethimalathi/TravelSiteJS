// Load login page
function loadLoginPage() {
    const loginPage = document.getElementById('login-page');
    loginPage.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h2 class="text-center mb-4">Login</h2>
                        <div id="login-error" class="error-message" style="display: none;"></div>
                        <form id="login-form">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" class="form-control" name="username" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Login</button>
                        </form>
                        <div class="text-center mt-3">
                            <p>Don't have an account? <a href="#" onclick="showPage('register')">Register here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';

    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.token) {
            authToken = response.token;
            localStorage.setItem('token', authToken);
            await fetchUserProfile();
            showToast('Login successful!', 'success');
            showPage('products');
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed';
        errorDiv.style.display = 'block';
    }
}

// Load register page
function loadRegisterPage() {
    const registerPage = document.getElementById('register-page');
    registerPage.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h2 class="text-center mb-4">Create Account</h2>
                        <div id="register-error" class="error-message" style="display: none;"></div>
                        <form id="register-form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>First Name</label>
                                        <input type="text" class="form-control" name="firstName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Last Name</label>
                                        <input type="text" class="form-control" name="lastName" required>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" class="form-control" name="username" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                            <div class="form-group">
                                <label>Confirm Password</label>
                                <input type="password" class="form-control" name="confirmPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Register</button>
                        </form>
                        <div class="text-center mt-3">
                            <p>Already have an account? <a href="#" onclick="showPage('login')">Login here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    if (data.password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName
            })
        });

        if (response.token) {
            authToken = response.token;
            localStorage.setItem('token', authToken);
            await fetchUserProfile();
            showToast('Registration successful!', 'success');
            showPage('products');
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Registration failed';
        errorDiv.style.display = 'block';
    }
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        const user = await apiRequest('/user/profile');
        currentUser = user;
        updateNavigation();
        updateCartCount();
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        logout();
    }
}

// Logout function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateNavigation();
    showPage('home');
    showToast('Logged out successfully', 'success');
}
