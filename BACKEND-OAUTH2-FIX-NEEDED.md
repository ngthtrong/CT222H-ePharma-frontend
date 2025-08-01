# 🔧 Backend OAuth2 Configuration Fix

## ❗ Vấn đề phát hiện

Hiện tại backend đang redirect OAuth2 callback về backend URL thay vì frontend. Điều này cần được sửa để OAuth2 flow hoạt động đúng.

### Current Flow (Problematic):
```
Google/Facebook -> Backend Callback -> Backend URL (stuck here)
```

### Expected Flow:
```
Google/Facebook -> Backend Callback -> Frontend Callback Page -> App
```

## 🔧 Solution Options

### Option 1: Backend Redirect to Frontend (Recommended)
Modify backend OAuth2 callback để redirect về frontend với token:

```java
// In OAuth2 callback handler
String frontendCallback = "http://localhost:5173/auth/oauth2/success"
    + "?token=" + jwtToken 
    + "&user=" + URLEncoder.encode(userDataJson, "UTF-8")
    + "&provider=" + provider;
    
return ResponseEntity.status(HttpStatus.FOUND)
    .location(URI.create(frontendCallback))
    .build();
```

### Option 2: Backend Return HTML Page
Backend trả về HTML page tự động redirect với token:

```java
@GetMapping("/oauth2/callback/{provider}")
public ResponseEntity<String> handleCallback(@PathVariable String provider, ...) {
    // Process OAuth2...
    
    String html = """
        <!DOCTYPE html>
        <html>
        <head><title>OAuth2 Success</title></head>
        <body>
            <script>
                const token = '%s';
                const user = %s;
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = 'http://localhost:5173/';
            </script>
        </body>
        </html>
        """.formatted(jwtToken, userDataJson);
    
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_HTML)
        .body(html);
}
```

### Option 3: JSONP-style Callback (Alternative)
Backend return JavaScript callback:

```java
String callback = """
    window.opener.postMessage({
        type: 'OAUTH2_SUCCESS',
        token: '%s',
        user: %s,
        provider: '%s'
    }, 'http://localhost:5173');
    window.close();
    """.formatted(jwtToken, userDataJson, provider);
```

## 🚀 Recommended Implementation

### Backend Changes Needed:

1. **Update OAuth2 Callback Handler:**
```java
@GetMapping("/auth/oauth2/callback/{provider}")
public ResponseEntity<Void> handleOAuth2Callback(
    @PathVariable String provider,
    @RequestParam String code,
    @RequestParam String state,
    HttpServletRequest request) {
    
    try {
        // Existing OAuth2 processing...
        OAuth2AuthResponse authResponse = processOAuth2Callback(provider, code, state);
        
        // Build frontend redirect URL
        String frontendUrl = buildFrontendRedirectUrl(authResponse, provider);
        
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(frontendUrl))
            .build();
            
    } catch (Exception e) {
        // Handle error and redirect to frontend with error
        String errorUrl = buildFrontendErrorUrl(e.getMessage(), provider);
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(errorUrl))
            .build();
    }
}

private String buildFrontendRedirectUrl(OAuth2AuthResponse authResponse, String provider) {
    try {
        String userDataJson = objectMapper.writeValueAsString(authResponse.getUser());
        String encodedUserData = URLEncoder.encode(userDataJson, StandardCharsets.UTF_8);
        
        return String.format(
            "%s/auth/oauth2/success?token=%s&user=%s&provider=%s",
            frontendBaseUrl,
            authResponse.getAccessToken(),
            encodedUserData,
            provider
        );
    } catch (Exception e) {
        throw new RuntimeException("Error building redirect URL", e);
    }
}

private String buildFrontendErrorUrl(String errorMessage, String provider) {
    return String.format(
        "%s/auth/oauth2/success?error=%s&provider=%s",
        frontendBaseUrl,
        URLEncoder.encode(errorMessage, StandardCharsets.UTF_8),
        provider
    );
}
```

2. **Add Configuration Property:**
```properties
# application.properties
oauth2.frontend.base-url=http://localhost:5173
oauth2.frontend.callback-path=/auth/oauth2/success
```

3. **Update OAuth2 Provider Settings:**
```
Google OAuth2 Redirect URI: 
http://localhost:8081/api/v1/auth/oauth2/callback/google

Facebook OAuth2 Redirect URI:
http://localhost:8081/api/v1/auth/oauth2/callback/facebook
```

### Frontend Changes (Already Implemented):

1. ✅ `OAuth2SuccessPage.jsx` - Handles frontend callback
2. ✅ `oauth2Auth.handleDirectSuccess()` - Processes token from URL
3. ✅ `AuthContext` updated to handle direct callback
4. ✅ Routes added for `/auth/oauth2/success`

## 🧪 Testing Flow

### After Backend Fix:
1. User clicks "Login with Google" in frontend
2. Frontend calls `/auth/oauth2/login/google`
3. Frontend redirects to Google OAuth
4. Google redirects to backend `/auth/oauth2/callback/google`
5. Backend processes OAuth and redirects to frontend `/auth/oauth2/success?token=...&user=...`
6. Frontend processes token and redirects to app

### Test URLs:
```
Backend OAuth2 status: http://localhost:8081/api/v1/auth/oauth2/status
Frontend demo page: http://localhost:5173/oauth2-demo
Frontend login page: http://localhost:5173/login
```

## ⚠️ Important Notes

1. **Security**: Passing JWT token in URL is acceptable for OAuth2 callback flow
2. **URL Length**: Ensure user data doesn't exceed URL length limits
3. **CORS**: Make sure CORS allows redirects between backend and frontend
4. **Environment**: Update URLs for production deployment

## 📞 Next Steps

1. Backend team implements recommended solution
2. Test OAuth2 flow end-to-end
3. Update production environment configuration
4. Document final implementation

---

**Current Status**: ⚠️ Waiting for backend OAuth2 callback redirect fix

**Frontend**: ✅ Ready and compatible with all solution options
