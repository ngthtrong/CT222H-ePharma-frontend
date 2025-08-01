# 🔐 OAuth2 Setup Guide - Backend

## 📋 Tổng quan
Hướng dẫn cấu hình và chạy OAuth2 authentication với Google và Facebook cho backend Spring Boot.

## 🚀 Quick Start

### 1. Clone và Setup
```bash
git clone <repository-url>
cd project-back-end
```

### 2. Cấu hình Environment Variables
Tạo file `.env` hoặc set environment variables:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth2
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Optional: Custom redirect URI
OAUTH2_REDIRECT_URI=http://localhost:8081/api/v1/auth/oauth2/callback
```

### 3. Build và Run
```bash
# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run
```

API sẽ chạy tại: `http://localhost:8081`

## 🔧 OAuth2 Provider Setup

### Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable các APIs:
   - Google+ API
   - Google OAuth2 API
4. Tạo OAuth2.0 credentials:
   - **Application type**: Web application
   - **Name**: Your App Name
   - **Authorized JavaScript origins**: 
     - `http://localhost:8081` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:8081/api/v1/auth/oauth2/callback/google` (development)
     - `https://yourdomain.com/api/v1/auth/oauth2/callback/google` (production)

### Facebook Developers
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới
3. **App Type**: Consumer
4. Thêm **Facebook Login** product
5. Cấu hình Facebook Login:
   - **Valid OAuth Redirect URIs**:
     - `http://localhost:8081/api/v1/auth/oauth2/callback/facebook` (development)
     - `https://yourdomain.com/api/v1/auth/oauth2/callback/facebook` (production)
   - **Valid Domains**: 
     - `localhost` (development)
     - `yourdomain.com` (production)

## 📡 API Endpoints

### OAuth2 Authentication Endpoints

#### 1. Get Authorization URL
```http
GET /api/v1/auth/oauth2/login/{provider}
```
**Parameters:**
- `provider`: `google` hoặc `facebook`

**Response:**
```json
{
  "success": true,
  "message": "URL đăng nhập OAuth2 đã được tạo",
  "data": {
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "state": "uuid-state-string",
    "provider": "google"
  }
}
```

#### 2. Process OAuth2 Callback
```http
POST /api/v1/auth/oauth2/callback/{provider}
Content-Type: application/json

{
  "code": "authorization_code_from_provider",
  "state": "uuid-state-string"
}
```

**Response:**
```json
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

#### 3. Check OAuth2 Status
```http
GET /api/v1/auth/oauth2/status
```

### Existing Authentication Endpoints
Tất cả endpoints hiện có vẫn hoạt động bình thường:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

## 🔒 Security Features

### 1. State Parameter Validation
- Tự động tạo và validate state parameter để prevent CSRF attacks
- State được store tạm thời và verify trong callback

### 2. JWT Token Generation
- OAuth2 users nhận cùng JWT token format như traditional login
- Token chứa user ID, email, và role
- Compatible với existing authorization system

### 3. User Account Linking
- Email được sử dụng làm identifier chính
- Nếu user đã tồn tại với email, sẽ update authProvider
- Nếu chưa tồn tại, tạo account mới với OAuth2 provider

### 4. Provider-specific Information
- Google: Lấy name, email, profile picture từ Google API
- Facebook: Lấy name, email, profile picture từ Facebook Graph API
- Tự động handle các trường dữ liệu khác nhau của từng provider

## 🛠️ Development

### Local Testing

#### 1. Test OAuth2 Endpoints với Postman

**Get Google Authorization URL:**
```http
GET http://localhost:8081/api/v1/auth/oauth2/login/google
```

**Test OAuth2 Status:**
```http
GET http://localhost:8081/api/v1/auth/oauth2/status
```

#### 2. Test Complete Flow
1. Gọi `/oauth2/login/google` để lấy authorization URL
2. Mở URL trong browser và complete Google OAuth flow
3. Copy authorization code từ callback URL
4. Gọi `/oauth2/callback/google` với code

### Database Schema
OAuth2 users được lưu trong cùng collection `users` với:
```json
{
  "_id": "ObjectId",
  "fullName": "User Full Name",
  "email": "user@gmail.com",
  "password": "", // Empty for OAuth2 users
  "authProvider": "google", // "google", "facebook", or "local"
  "role": "USER",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Error Handling
API trả về consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common error scenarios:
- Invalid provider name
- Missing environment variables
- OAuth2 provider errors
- Network connectivity issues
- Invalid authorization codes
- State parameter mismatch

## 🚀 Production Deployment

### 1. Environment Variables
```bash
# Required
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
FACEBOOK_CLIENT_ID=your_production_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_production_facebook_client_secret

# Optional
OAUTH2_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/oauth2/callback
```

### 2. Update OAuth2 Provider Settings
- Update redirect URIs to production domains
- Add production domains to authorized origins
- Test OAuth2 flow in production environment

### 3. SSL/HTTPS
- OAuth2 providers require HTTPS in production
- Ensure SSL certificate is properly configured
- Update all redirect URIs to use `https://`

## 📚 Frontend Integration
Xem chi tiết trong file: [OAuth2-Frontend-Guide.md](./OAuth2-Frontend-Guide.md)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Google OAuth2 login flow
- [ ] Facebook OAuth2 login flow  
- [ ] Error handling (user cancellation)
- [ ] Existing user account linking
- [ ] New user account creation
- [ ] JWT token generation and validation
- [ ] API authorization with OAuth2 tokens
- [ ] Logout functionality

### Unit Tests
```bash
# Run tests
./mvnw test

# Run specific OAuth2 tests
./mvnw test -Dtest=OAuth2*
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Client ID not found"
- Verify `GOOGLE_CLIENT_ID` và `FACEBOOK_CLIENT_ID` environment variables
- Check application.properties configuration

#### 2. "Redirect URI mismatch"
- Ensure redirect URIs trong OAuth2 provider settings match exactly
- Format: `http://localhost:8081/api/v1/auth/oauth2/callback/{provider}`

#### 3. "Invalid client secret"
- Verify `GOOGLE_CLIENT_SECRET` và `FACEBOOK_CLIENT_SECRET` environment variables
- Regenerate secrets if necessary

#### 4. "State parameter mismatch"
- Clear browser cache and localStorage
- Ensure state parameter được properly stored và retrieved

#### 5. CORS Issues
- CORS đã được cấu hình cho OAuth2 endpoints
- Nếu vẫn gặp issues, check SecurityConfig.java

### Debug Mode
Enable debug logging:
```properties
logging.level.ct222h.vegeta.projectbackend.service.OAuth2UserService=DEBUG
logging.level.org.springframework.security=DEBUG
```

## 📞 Support
Nếu gặp vấn đề:
1. Check application logs
2. Verify OAuth2 provider configuration  
3. Test với Postman trước khi integrate frontend
4. Check environment variables
5. Ensure database connectivity

---

**Happy coding! 🎉**
