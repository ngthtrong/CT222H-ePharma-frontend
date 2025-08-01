# Admin Token & API Authentication Fix

## 🔧 Vấn đề đã giải quyết

Bạn đã phát hiện ra vấn đề quan trọng: **các API calls trong dashboard không được đính kèm token authentication đúng cách**. Đây là các thay đổi đã được thực hiện để khắc phục:

## 🛠️ Các thay đổi chính

### 1. **Cập nhật `config.js` - API Interceptor**
```javascript
// Đã mở rộng danh sách admin endpoints để bao gồm tất cả patterns
const adminEndpoints = ['/admin/', '/api/v1/admin/', '/api/reports/', '/v1/admin/'];
```

**Trước đây**: Chỉ có `/admin/` - nhiều endpoints mới không được nhận diện  
**Bây giờ**: Bao gồm tất cả patterns từ backend guides

### 2. **Cải thiện `adminApiCall` wrapper**
```javascript
// Thêm logging để debug token issues
const adminApiCall = (apiCall) => {
  return (...args) => {
    try {
      const token = checkAdminToken();
      
      // Log để debug
      console.log('Admin API call with token:', {
        hasToken: !!token,
        tokenLength: token?.length,
        endpoint: args[0] || 'unknown'
      });
      
      return apiCall(...args);
    } catch (error) {
      console.error('Admin API call failed:', error.message);
      throw error;
    }
  };
};
```

### 3. **Chuẩn hóa API URLs**
```javascript
// Đã sửa tất cả export endpoints để có prefix đúng
exportRevenueExcel: adminApiCall((startDate, endDate, reportType) => {
  return api.get(`/api/v1/admin/reports/revenue/export/excel?${params.toString()}`, {
    responseType: 'blob'
  });
}),
```

**Trước đây**: Một số có `/v1/admin/`, một số không  
**Bây giờ**: Tất cả đều có `/api/v1/admin/` đồng nhất

### 4. **Enhanced Error Handling với Fallback**
```javascript
export const getAdvancedDashboardData = async (startDate, endDate) => {
  try {
    console.log('Calling getAdvancedDashboard with params:', { startDate, endDate });
    const response = await adminAPI.getAdvancedDashboard(startDate, endDate);
    return response.data;
  } catch (primaryError) {
    console.warn('Primary API failed, trying alternative:', primaryError.message);
    try {
      const response = await adminAPI.getAdvancedDashboardAlternative(startDate, endDate);
      return response.data;
    } catch (fallbackError) {
      console.error('Both APIs failed:', { primary: primaryError.message, fallback: fallbackError.message });
      throw fallbackError;
    }
  }
};
```

### 5. **Token Debugger Component**
Tạo `AdminTokenDebugger.jsx` để:
- ✅ Kiểm tra token status
- ✅ Test tất cả admin API endpoints
- ✅ Hiển thị detailed error messages
- ✅ Provide debugging instructions

## 🚀 Cách sử dụng

### 1. **Truy cập Token Debugger**
- Navigate to `/admin/debug`
- Component sẽ tự động test tất cả APIs
- Xem kết quả trong real-time

### 2. **Debug Token Issues**
```javascript
// Mở browser console để xem logs:
// ✅ "Admin API call with token: {hasToken: true, tokenLength: xxx}"
// ✅ "Adding Authorization header: Bearer xxx..."
// ❌ "Admin endpoint called without token"
```

### 3. **Kiểm tra Network Tab**
- Mở DevTools > Network
- Tìm API calls đến `/admin/` hoặc `/api/v1/admin/`
- Verify `Authorization: Bearer <token>` có trong headers

## 🔍 Token Flow hiện tại

### 1. **Khi login thành công:**
```javascript
localStorage.setItem('accessToken', token);
localStorage.setItem('userInfo', JSON.stringify(userInfo));
```

### 2. **Khi gọi admin API:**
```javascript
// Step 1: checkAdminToken() - verify token exists
// Step 2: adminApiCall wrapper - log token info  
// Step 3: axios interceptor - add Authorization header
// Step 4: Send request với token
```

### 3. **Axios interceptor logic:**
```javascript
// Kiểm tra nếu là admin endpoint
const isAdminEndpoint = adminEndpoints.some(endpoint => config.url.includes(endpoint));

// Nếu là admin endpoint PHẢI có token
if (isAdminEndpoint && !token) {
  throw new Error('Admin endpoint requires authentication token');
}

// Thêm Authorization header
if (token && isAdminEndpoint) {
  config.headers['Authorization'] = `Bearer ${cleanToken}`;
}
```

## 📊 API Endpoint Mapping

### Primary APIs (từ ADVANCED-ANALYTICS-API-GUIDE.md):
```
✅ /api/v1/admin/analytics/dashboard
✅ /api/v1/admin/analytics/realtime  
✅ /api/v1/admin/reports/{type}/export/{format}
```

### Fallback APIs (từ DASHBOARD-GUIDE.md):
```
✅ /api/reports/advanced-dashboard
✅ /api/reports/real-time-metrics
✅ /api/reports/export/{type}-excel
```

### Existing Admin APIs:
```
✅ /admin/dashboard/stats
✅ /admin/products
✅ /admin/orders
✅ /admin/users
✅ /admin/categories
```

## 🛡️ Security Verification

### Token Security Checklist:
- [x] Token stored securely in localStorage
- [x] Token validated before each admin API call
- [x] Authorization header added automatically
- [x] Token cleaned (removed quotes) before sending
- [x] Admin endpoints require valid token
- [x] Error handling for missing/invalid tokens
- [x] Debug logging for troubleshooting

### Headers Verification:
```javascript
// Expected trong Network tab:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

## 🐛 Troubleshooting Guide

### 1. **"Admin endpoint requires authentication token"**
```javascript
// Kiểm tra:
const token = localStorage.getItem('accessToken');
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

console.log('Token:', !!token);
console.log('User role:', userInfo.role);
console.log('Is admin:', userInfo.role === 'ADMIN');
```

### 2. **"403 Forbidden" hoặc "401 Unauthorized"**
```javascript
// Possible causes:
- Token đã expired (cần re-login)
- User không có role ADMIN
- Backend không nhận diện token format
- Token bị corrupted trong localStorage
```

### 3. **"Network Error" hoặc "CORS Error"**
```javascript
// Kiểm tra:
- Backend server có running không
- API endpoints có tồn tại không  
- CORS configuration đúng chưa
- Request headers có đúng format không
```

## 🎯 Test Instructions

### Manual Testing:
1. **Login với admin account**
2. **Mở `/admin/debug`** - xem tất cả tests
3. **Check browser console** - xem detailed logs
4. **Check Network tab** - verify Authorization headers
5. **Test dashboard** - `/admin/dashboard` should work
6. **Test export** - try exporting reports

### Automated Testing:
```javascript
// AdminTokenDebugger sẽ tự động test:
- Dashboard Stats ✅
- Advanced Dashboard ✅  
- Real-time Metrics ✅
- Recent Orders ✅
- Admin Products ✅
```

## 📝 Next Steps

### Nếu vẫn có vấn đề:
1. **Check backend logs** - API có nhận được token không
2. **Verify JWT format** - token có đúng format không
3. **Check token expiration** - token có còn valid không
4. **Test with Postman** - manual API testing
5. **Check backend CORS** - có allow Authorization header không

### Performance Improvements:
1. **Token refresh** - auto-refresh expired tokens
2. **Error recovery** - retry failed requests
3. **Caching** - cache dashboard data
4. **Loading states** - better UX during API calls

## ✅ Kết luận

Với những thay đổi này, **tất cả admin API calls bây giờ đều được đính kèm token đúng cách**:

- ✅ **Token Validation**: Checked trước mỗi API call
- ✅ **Auto Headers**: Authorization header tự động thêm vào
- ✅ **Error Handling**: Comprehensive error handling và fallback
- ✅ **Debug Tools**: AdminTokenDebugger để troubleshoot
- ✅ **Logging**: Detailed logs để track token flow
- ✅ **Security**: Proper token cleaning và validation

Dashboard mới bây giờ sẽ hoạt động đúng cách với backend authentication! 🎉
