# 🚀 OAuth2 Frontend Integration Guide

## 📋 Mục lục
- [Tổng quan](#tổng-quan)
- [Setup Environment](#setup-environment)
- [API Endpoints](#api-endpoints)
- [Frontend Implementation](#frontend-implementation)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)
- [Testing](#testing)

## 🎯 Tổng quan

Guide này hướng dẫn tích hợp OAuth2 authentication với Google và Facebook vào ứng dụng frontend, sử dụng API backend đã được implement.

### Flow OAuth2
1. Frontend gọi API để lấy authorization URL
2. Redirect user đến OAuth2 provider (Google/Facebook)
3. User đăng nhập và cho phép quyền truy cập
4. Provider redirect về callback URL với authorization code
5. Frontend gửi code đến backend để lấy JWT token
6. Lưu JWT token và redirect user vào app

## 🔧 Setup Environment

### Backend Environment Variables
```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth2
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Redirect URI (production)
OAUTH2_REDIRECT_URI=https://yourdomain.com/api/v1/auth/oauth2/callback
```

### Cấu hình OAuth2 Providers

#### Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Google+ API và Google OAuth2 API
4. Tạo OAuth2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: `http://localhost:8081/api/v1/auth/oauth2/callback/google`
     - Production: `https://yourdomain.com/api/v1/auth/oauth2/callback/google`

#### Facebook Developers
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới
3. Thêm Facebook Login product
4. Cấu hình Valid OAuth Redirect URIs:
   - Development: `http://localhost:8081/api/v1/auth/oauth2/callback/facebook`
   - Production: `https://yourdomain.com/api/v1/auth/oauth2/callback/facebook`

## 📡 API Endpoints

### Base URL
- Development: `http://localhost:8081/api/v1/auth/oauth2`
- Production: `https://yourdomain.com/api/v1/auth/oauth2`

### 1. Get Authorization URL
**GET** `/login/{provider}`

```javascript
// Request
GET /api/v1/auth/oauth2/login/google

// Response
{
  "success": true,
  "message": "URL đăng nhập OAuth2 đã được tạo",
  "data": {
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
    "state": "uuid-state-string",
    "provider": "google"
  }
}
```

### 2. Process OAuth2 Callback
**POST** `/callback/{provider}`

```javascript
// Request
POST /api/v1/auth/oauth2/callback/google
{
  "code": "authorization_code_from_provider",
  "state": "uuid-state-string"
}

// Response
{
  "success": true,
  "message": "Đăng nhập OAuth2 thành công",
  "data": {
    "accessToken": "jwt_token",
    "tokenType": "Bearer",
    "user": {
      "id": "user_id",
      "fullName": "User Name",
      "email": "user@example.com",
      "role": "USER",
      "authProvider": "google"
    }
  }
}
```

### 3. Check OAuth2 Status
**GET** `/status`

```javascript
// Response
{
  "success": true,
  "message": "OAuth2 đã được cấu hình",
  "data": "Providers: google, facebook"
}
```

## 💻 Frontend Implementation

### HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>OAuth2 Login</title>
</head>
<body>
    <div id="loginContainer">
        <h2>Đăng nhập</h2>
        
        <!-- Traditional Login -->
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Mật khẩu" required>
            <button type="submit">Đăng nhập</button>
        </form>
        
        <div class="divider">HOẶC</div>
        
        <!-- OAuth2 Login -->
        <div class="oauth2-buttons">
            <button id="googleLogin" class="oauth2-btn google-btn">
                <img src="google-icon.png" alt="Google" />
                Đăng nhập với Google
            </button>
            
            <button id="facebookLogin" class="oauth2-btn facebook-btn">
                <img src="facebook-icon.png" alt="Facebook" />
                Đăng nhập với Facebook
            </button>
        </div>
    </div>

    <script src="oauth2-auth.js"></script>
</body>
</html>
```

### CSS Styling
```css
.oauth2-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
}

.oauth2-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 24px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    color: #333;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.oauth2-btn:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transform: translateY(-1px);
}

.google-btn:hover {
    border-color: #4285f4;
}

.facebook-btn:hover {
    border-color: #1877f2;
}

.oauth2-btn img {
    width: 20px;
    height: 20px;
}

.divider {
    text-align: center;
    margin: 20px 0;
    position: relative;
    color: #666;
}

.divider:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #ddd;
    z-index: -1;
}

.divider {
    background: white;
    padding: 0 20px;
    display: inline-block;
}
```

### JavaScript Implementation

#### 1. OAuth2 Authentication Class
```javascript
class OAuth2Auth {
    constructor(baseURL = 'http://localhost:8081/api/v1/auth') {
        this.baseURL = baseURL;
        this.pendingState = null;
    }

    /**
     * Initiate OAuth2 login
     * @param {string} provider - 'google' or 'facebook'
     */
    async login(provider) {
        try {
            console.log(`Initiating ${provider} OAuth2 login...`);
            
            // Get authorization URL
            const response = await fetch(`${this.baseURL}/oauth2/login/${provider}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }

            // Store state for verification
            this.pendingState = data.data.state;
            localStorage.setItem('oauth2_state', data.data.state);
            localStorage.setItem('oauth2_provider', provider);

            // Redirect to OAuth2 provider
            window.location.href = data.data.authorizationUrl;
            
        } catch (error) {
            console.error(`OAuth2 ${provider} login error:`, error);
            this.showError(`Lỗi đăng nhập ${provider}: ${error.message}`);
        }
    }

    /**
     * Handle OAuth2 callback
     */
    async handleCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            const errorDescription = urlParams.get('error_description');

            // Check for errors
            if (error) {
                throw new Error(`OAuth2 error: ${error} - ${errorDescription || 'Unknown error'}`);
            }

            if (!code) {
                throw new Error('Authorization code not found');
            }

            // Verify state
            const storedState = localStorage.getItem('oauth2_state');
            if (!state || state !== storedState) {
                throw new Error('Invalid state parameter - possible CSRF attack');
            }

            const provider = localStorage.getItem('oauth2_provider');
            if (!provider) {
                throw new Error('Provider not found in storage');
            }

            console.log(`Processing ${provider} OAuth2 callback...`);

            // Send code to backend
            const response = await fetch(`${this.baseURL}/oauth2/callback/${provider}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    state: state
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            // Store JWT token
            this.storeAuthData(data.data);

            // Clean up
            this.cleanup();

            // Redirect to dashboard
            this.redirectToDashboard();

        } catch (error) {
            console.error('OAuth2 callback error:', error);
            this.showError(`Lỗi xử lý callback: ${error.message}`);
            this.cleanup();
            this.redirectToLogin();
        }
    }

    /**
     * Store authentication data
     */
    storeAuthData(authData) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('tokenType', authData.tokenType || 'Bearer');
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('loginTime', new Date().toISOString());
        
        console.log('OAuth2 login successful:', authData.user);
    }

    /**
     * Clean up OAuth2 temporary data
     */
    cleanup() {
        localStorage.removeItem('oauth2_state');
        localStorage.removeItem('oauth2_provider');
        this.pendingState = null;
        
        // Clean URL
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return token && token.trim() !== '';
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetch(`${this.baseURL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            
            // Redirect to login
            this.redirectToLogin();
        }
    }

    /**
     * Make authenticated API requests
     */
    async apiRequest(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            throw new Error('No authentication token');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.logout();
            throw new Error('Authentication expired. Please login again.');
        }

        return response;
    }

    /**
     * Show error message
     */
    showError(message) {
        // You can customize this based on your UI framework
        alert(message);
        
        // Or use a toast/notification library
        // toast.error(message);
        
        // Or update a DOM element
        // document.getElementById('errorMessage').textContent = message;
    }

    /**
     * Redirect to dashboard
     */
    redirectToDashboard() {
        window.location.href = '/dashboard';
    }

    /**
     * Redirect to login
     */
    redirectToLogin() {
        window.location.href = '/login';
    }
}
```

#### 2. Application Integration
```javascript
// Initialize OAuth2 authentication
const oauth2Auth = new OAuth2Auth();

// DOM elements
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const loginForm = document.getElementById('loginForm');

// Check if this is a callback page
function checkForCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
        // This is an OAuth2 callback
        oauth2Auth.handleCallback();
        return true;
    }
    return false;
}

// Initialize page
function initializePage() {
    // Check if user is already authenticated
    if (oauth2Auth.isAuthenticated()) {
        oauth2Auth.redirectToDashboard();
        return;
    }

    // Check if this is a callback
    if (checkForCallback()) {
        return;
    }

    // Setup event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // OAuth2 login buttons
    googleLoginBtn.addEventListener('click', () => {
        oauth2Auth.login('google');
    });

    facebookLoginBtn.addEventListener('click', () => {
        oauth2Auth.login('facebook');
    });

    // Traditional login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                oauth2Auth.storeAuthData(data.data);
                oauth2Auth.redirectToDashboard();
            } else {
                oauth2Auth.showError(data.message);
            }
        } catch (error) {
            oauth2Auth.showError('Lỗi đăng nhập: ' + error.message);
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
```

#### 3. Dashboard Integration
```javascript
// dashboard.js
class Dashboard {
    constructor() {
        this.oauth2Auth = new OAuth2Auth();
        this.user = null;
    }

    async init() {
        // Check authentication
        if (!this.oauth2Auth.isAuthenticated()) {
            this.oauth2Auth.redirectToLogin();
            return;
        }

        // Get current user
        this.user = this.oauth2Auth.getCurrentUser();
        
        if (!this.user) {
            this.oauth2Auth.logout();
            return;
        }

        // Setup UI
        this.setupUserInterface();
        this.setupEventListeners();
        
        // Load dashboard data
        await this.loadDashboardData();
    }

    setupUserInterface() {
        // Display user info
        document.getElementById('userName').textContent = this.user.fullName;
        document.getElementById('userEmail').textContent = this.user.email;
        
        // Show OAuth2 provider if applicable
        if (this.user.authProvider !== 'local') {
            const providerBadge = document.createElement('span');
            providerBadge.className = 'provider-badge';
            providerBadge.textContent = this.user.authProvider.toUpperCase();
            document.getElementById('userInfo').appendChild(providerBadge);
        }
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.oauth2Auth.logout();
        });
    }

    async loadDashboardData() {
        try {
            // Make authenticated API calls
            const response = await this.oauth2Auth.apiRequest('/api/v1/users/me');
            const userData = await response.json();
            
            if (userData.success) {
                // Update UI with fresh user data
                this.updateUserData(userData.data);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateUserData(userData) {
        // Update user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;
    }
}

// Initialize dashboard
const dashboard = new Dashboard();
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
});
```

## 🚨 Error Handling

### Common Error Scenarios

#### 1. OAuth2 Provider Errors
```javascript
// Handle provider-specific errors
function handleOAuth2Error(error, provider) {
    const errorMessages = {
        'access_denied': `Bạn đã từ chối quyền truy cập ${provider}`,
        'invalid_request': 'Yêu cầu không hợp lệ',
        'unauthorized_client': 'Ứng dụng chưa được ủy quyền',
        'unsupported_response_type': 'Loại phản hồi không được hỗ trợ',
        'invalid_scope': 'Phạm vi quyền không hợp lệ',
        'server_error': `Lỗi server ${provider}`,
        'temporarily_unavailable': `Dịch vụ ${provider} tạm thời không khả dụng`
    };

    const message = errorMessages[error] || `Lỗi ${provider}: ${error}`;
    oauth2Auth.showError(message);
}
```

#### 2. Network Errors
```javascript
// Retry mechanism for network errors
async function apiRequestWithRetry(url, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            lastError = error;
            
            if (i < maxRetries - 1) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }
    
    throw lastError;
}
```

#### 3. Token Expiration
```javascript
// Handle token expiration gracefully
oauth2Auth.apiRequest = async function(url, options = {}) {
    try {
        const response = await this.makeRequest(url, options);
        return response;
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('expired')) {
            // Try to refresh token or logout
            this.handleTokenExpiration();
        }
        throw error;
    }
};

oauth2Auth.handleTokenExpiration = function() {
    // Show notification
    this.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    
    // Logout after delay
    setTimeout(() => {
        this.logout();
    }, 2000);
};
```

## 🔒 Security Best Practices

### 1. State Parameter Validation
```javascript
// Always validate state parameter to prevent CSRF
function validateState(receivedState) {
    const storedState = localStorage.getItem('oauth2_state');
    
    if (!receivedState || !storedState || receivedState !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    return true;
}
```

### 2. Secure Token Storage
```javascript
// Consider using sessionStorage for more security
class SecureStorage {
    static setToken(token) {
        // Use sessionStorage instead of localStorage for better security
        sessionStorage.setItem('accessToken', token);
        
        // Or implement encrypted storage
        // const encrypted = CryptoJS.AES.encrypt(token, secretKey);
        // localStorage.setItem('accessToken', encrypted);
    }
    
    static getToken() {
        return sessionStorage.getItem('accessToken');
        
        // Or decrypt if using encryption
        // const encrypted = localStorage.getItem('accessToken');
        // const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey);
        // return decrypted.toString(CryptoJS.enc.Utf8);
    }
}
```

### 3. Content Security Policy
```html
<!-- Add CSP headers for security -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://accounts.google.com https://graph.facebook.com; 
               frame-src https://accounts.google.com https://www.facebook.com;">
```

### 4. URL Validation
```javascript
// Validate redirect URLs
function validateRedirectURL(url) {
    const allowedDomains = [
        'accounts.google.com',
        'www.facebook.com',
        'facebook.com'
    ];
    
    try {
        const urlObj = new URL(url);
        return allowedDomains.includes(urlObj.hostname);
    } catch (error) {
        return false;
    }
}
```

## 🧪 Testing

### 1. Unit Tests (Jest)
```javascript
// oauth2.test.js
describe('OAuth2Auth', () => {
    let oauth2Auth;
    
    beforeEach(() => {
        oauth2Auth = new OAuth2Auth('http://localhost:8081/api/v1/auth');
        localStorage.clear();
    });
    
    test('should generate correct login URL', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({
                success: true,
                data: {
                    authorizationUrl: 'https://accounts.google.com/oauth...',
                    state: 'test-state',
                    provider: 'google'
                }
            })
        });
        
        await oauth2Auth.login('google');
        
        expect(localStorage.getItem('oauth2_state')).toBe('test-state');
        expect(localStorage.getItem('oauth2_provider')).toBe('google');
    });
    
    test('should handle callback correctly', async () => {
        // Mock URL params
        delete window.location;
        window.location = { search: '?code=test-code&state=test-state' };
        
        localStorage.setItem('oauth2_state', 'test-state');
        localStorage.setItem('oauth2_provider', 'google');
        
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({
                success: true,
                data: {
                    accessToken: 'test-token',
                    user: { id: '1', email: 'test@example.com' }
                }
            })
        });
        
        await oauth2Auth.handleCallback();
        
        expect(localStorage.getItem('accessToken')).toBe('test-token');
    });
});
```

### 2. Integration Tests
```javascript
// integration.test.js
describe('OAuth2 Integration', () => {
    test('complete OAuth2 flow', async () => {
        // 1. Initiate login
        const loginResponse = await fetch('/api/v1/auth/oauth2/login/google');
        const loginData = await loginResponse.json();
        
        expect(loginData.success).toBe(true);
        expect(loginData.data.authorizationUrl).toContain('accounts.google.com');
        
        // 2. Simulate callback (would be done by OAuth2 provider)
        const callbackResponse = await fetch('/api/v1/auth/oauth2/callback/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'mock-auth-code',
                state: loginData.data.state
            })
        });
        
        const callbackData = await callbackResponse.json();
        expect(callbackData.success).toBe(true);
        expect(callbackData.data.accessToken).toBeDefined();
    });
});
```

### 3. Manual Testing Checklist
- [ ] Google OAuth2 login flow
- [ ] Facebook OAuth2 login flow
- [ ] Error handling (user denial, network errors)
- [ ] State parameter validation
- [ ] Token storage and retrieval
- [ ] Logout functionality
- [ ] Authenticated API requests
- [ ] Token expiration handling
- [ ] Multiple browser/tab testing
- [ ] Mobile browser testing

## 🚀 Deployment

### Production Configuration
```javascript
// config.js
const config = {
    development: {
        apiBaseURL: 'http://localhost:8081/api/v1/auth',
        redirectURL: 'http://localhost:3000'
    },
    production: {
        apiBaseURL: 'https://api.yourdomain.com/api/v1/auth',
        redirectURL: 'https://yourdomain.com'
    }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Environment Variables
```bash
# .env.production
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_OAUTH2_REDIRECT_URL=https://yourdomain.com/auth/callback

# Backend
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
FACEBOOK_CLIENT_ID=your_production_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_production_facebook_client_secret
OAUTH2_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/oauth2/callback
```

---

## 📞 Support

Nếu gặp vấn đề khi tích hợp OAuth2, vui lòng:

1. Kiểm tra console browser để xem lỗi chi tiết
2. Verify OAuth2 provider configuration
3. Check network tab trong DevTools
4. Đảm bảo redirect URIs được cấu hình đúng
5. Kiểm tra environment variables

**Happy coding! 🎉**
