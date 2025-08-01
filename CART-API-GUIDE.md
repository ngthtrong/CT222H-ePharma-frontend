# Hướng Dẫn Sử Dụng Cart API cho Frontend

## Tổng Quan

API Cart hỗ trợ cả **User khách** (Guest User) và **User đã đăng nhập** (Authenticated User). Hệ thống sử dụng hai cơ chế khác nhau để quản lý giỏ hàng:

- **User đã đăng nhập**: Giỏ hàng được liên kết với `userId` thông qua JWT token
- **User khách**: Giỏ hàng được liên kết với `sessionId` được lưu trong localStorage/cookie

## Base URL

```
http://localhost:8080/api/v1/cart
```

## Authentication & Session Management

### User Đã Đăng Nhập
```javascript
const headers = {
    'Authorization': 'Bearer <JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

### User Khách
```javascript
const headers = {
    'X-Cart-Session-ID': localStorage.getItem('cartSessionId') || '',
    'Content-Type': 'application/json'
};
```

## API Endpoints

### 1. Lấy Giỏ Hàng Hiện Tại

**GET** `/api/v1/cart`

#### User Đã Đăng Nhập
```javascript
async function getCart() {
    const response = await fetch('/api/v1/cart', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // CartResponse object
}
```

#### User Khách
```javascript
async function getCartForGuest() {
    const sessionId = localStorage.getItem('cartSessionId');
    
    const response = await fetch('/api/v1/cart', {
        method: 'GET',
        headers: {
            'X-Cart-Session-ID': sessionId || '',
            'Content-Type': 'application/json'
        }
    });
    
    // Lưu session ID mới nếu được trả về
    const newSessionId = response.headers.get('X-Cart-Session-ID');
    if (newSessionId) {
        localStorage.setItem('cartSessionId', newSessionId);
    }
    
    const data = await response.json();
    return data.data;
}
```

### 2. Thêm Sản Phẩm Vào Giỏ Hàng

**POST** `/api/v1/cart/items`

#### Request Body
```json
{
    "productId": "product_id_here",
    "quantity": 2
}
```

#### User Đã Đăng Nhập
```javascript
async function addToCart(productId, quantity) {
    const response = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity
        })
    });
    
    const data = await response.json();
    return data.data;
}
```

#### User Khách
```javascript
async function addToCartForGuest(productId, quantity) {
    const sessionId = localStorage.getItem('cartSessionId');
    
    const response = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers: {
            'X-Cart-Session-ID': sessionId || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity
        })
    });
    
    // Lưu session ID mới nếu được trả về
    const newSessionId = response.headers.get('X-Cart-Session-ID');
    if (newSessionId) {
        localStorage.setItem('cartSessionId', newSessionId);
    }
    
    const data = await response.json();
    return data.data;
}
```

### 3. Cập Nhật Số Lượng Sản Phẩm

**PUT** `/api/v1/cart/items/{productId}`

#### Request Body
```json
{
    "quantity": 3
}
```

#### Implementation
```javascript
async function updateCartItemQuantity(productId, quantity, isAuthenticated = false) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (isAuthenticated) {
        headers['Authorization'] = 'Bearer ' + getToken();
    } else {
        headers['X-Cart-Session-ID'] = localStorage.getItem('cartSessionId') || '';
    }
    
    const response = await fetch(`/api/v1/cart/items/${productId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            quantity: quantity
        })
    });
    
    // Xử lý session ID cho guest user
    if (!isAuthenticated) {
        const newSessionId = response.headers.get('X-Cart-Session-ID');
        if (newSessionId) {
            localStorage.setItem('cartSessionId', newSessionId);
        }
    }
    
    const data = await response.json();
    return data.data;
}
```

### 4. Xóa Sản Phẩm Khỏi Giỏ Hàng

**DELETE** `/api/v1/cart/items/{productId}`

```javascript
async function removeFromCart(productId, isAuthenticated = false) {
    const headers = {};
    
    if (isAuthenticated) {
        headers['Authorization'] = 'Bearer ' + getToken();
    } else {
        headers['X-Cart-Session-ID'] = localStorage.getItem('cartSessionId') || '';
    }
    
    const response = await fetch(`/api/v1/cart/items/${productId}`, {
        method: 'DELETE',
        headers: headers
    });
    
    // Xử lý session ID cho guest user
    if (!isAuthenticated) {
        const newSessionId = response.headers.get('X-Cart-Session-ID');
        if (newSessionId) {
            localStorage.setItem('cartSessionId', newSessionId);
        }
    }
    
    const data = await response.json();
    return data.data;
}
```

### 5. Xóa Toàn Bộ Giỏ Hàng

**DELETE** `/api/v1/cart`

```javascript
async function clearCart(isAuthenticated = false) {
    const headers = {};
    
    if (isAuthenticated) {
        headers['Authorization'] = 'Bearer ' + getToken();
    } else {
        headers['X-Cart-Session-ID'] = localStorage.getItem('cartSessionId') || '';
    }
    
    const response = await fetch('/api/v1/cart', {
        method: 'DELETE',
        headers: headers
    });
    
    const data = await response.json();
    return data;
}
```

### 6. Gộp Giỏ Hàng Khi Đăng Nhập

**POST** `/api/v1/cart/merge`

Sử dụng khi user guest đăng nhập và muốn gộp giỏ hàng guest vào tài khoản.

```javascript
async function mergeCartOnLogin() {
    const sessionId = localStorage.getItem('cartSessionId');
    
    if (!sessionId) {
        return null; // Không có giỏ hàng guest để gộp
    }
    
    const response = await fetch('/api/v1/cart/merge', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getToken(),
            'X-Cart-Session-ID': sessionId,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        // Xóa session ID sau khi gộp thành công
        localStorage.removeItem('cartSessionId');
        const data = await response.json();
        return data.data;
    }
    
    throw new Error('Không thể gộp giỏ hàng');
}
```

## Response Format

### CartResponse Structure
```json
{
    "success": true,
    "message": "Thành công",
    "data": {
        "id": "cart_id",
        "userId": "user_id_or_null",
        "sessionId": "session_id_or_null",
        "items": [
            {
                "productId": "product_id",
                "productName": "Tên sản phẩm",
                "productImage": "image_url",
                "productPrice": 100000.0,
                "discountedPrice": 90000.0,
                "quantity": 2,
                "subtotal": 180000.0
            }
        ],
        "totalAmount": 180000.0,
        "createdAt": "2025-07-31T10:00:00",
        "updatedAt": "2025-07-31T10:30:00"
    }
}
```

## Workflow Logic cho Frontend

### 1. Khởi Tạo Giỏ Hàng

```javascript
class CartManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        return token && !this.isTokenExpired(token);
    }
    
    async initializeCart() {
        if (this.isAuthenticated) {
            return await this.getAuthenticatedUserCart();
        } else {
            return await this.getGuestCart();
        }
    }
    
    async getAuthenticatedUserCart() {
        // Logic cho user đã đăng nhập
        return await getCart();
    }
    
    async getGuestCart() {
        // Logic cho guest user
        return await getCartForGuest();
    }
}
```

### 2. Xử Lý Đăng Nhập

```javascript
async function handleUserLogin() {
    const cartManager = new CartManager();
    
    try {
        // Gộp giỏ hàng guest vào tài khoản (nếu có)
        const mergedCart = await mergeCartOnLogin();
        
        if (mergedCart) {
            console.log('Đã gộp giỏ hàng guest vào tài khoản');
            return mergedCart;
        } else {
            // Lấy giỏ hàng của user đã đăng nhập
            return await cartManager.getAuthenticatedUserCart();
        }
    } catch (error) {
        console.error('Lỗi khi xử lý đăng nhập:', error);
        // Fallback: lấy giỏ hàng user đã đăng nhập
        return await cartManager.getAuthenticatedUserCart();
    }
}
```

### 3. Xử Lý Đăng Xuất

```javascript
function handleUserLogout() {
    // Xóa token
    localStorage.removeItem('authToken');
    
    // Không xóa cartSessionId để giữ giỏ hàng guest
    // localStorage.removeItem('cartSessionId');
    
    // Reload cart với chế độ guest
    const cartManager = new CartManager();
    return cartManager.getGuestCart();
}
```

### 4. Universal Cart Functions

```javascript
class UniversalCart {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        return token && !this.isTokenExpired(token);
    }
    
    async addItem(productId, quantity) {
        if (this.isAuthenticated) {
            return await addToCart(productId, quantity);
        } else {
            return await addToCartForGuest(productId, quantity);
        }
    }
    
    async updateQuantity(productId, quantity) {
        return await updateCartItemQuantity(productId, quantity, this.isAuthenticated);
    }
    
    async removeItem(productId) {
        return await removeFromCart(productId, this.isAuthenticated);
    }
    
    async getCart() {
        if (this.isAuthenticated) {
            return await getCart();
        } else {
            return await getCartForGuest();
        }
    }
    
    async clearCart() {
        return await clearCart(this.isAuthenticated);
    }
}
```

## Error Handling

```javascript
async function handleCartOperation(operation) {
    try {
        const result = await operation();
        return result;
    } catch (error) {
        if (error.status === 401) {
            // Token hết hạn, chuyển sang chế độ guest
            localStorage.removeItem('authToken');
            window.location.reload();
        } else if (error.status === 400) {
            // Lỗi validation
            console.error('Dữ liệu không hợp lệ:', error.message);
        } else if (error.status === 404) {
            // Sản phẩm không tồn tại
            console.error('Sản phẩm không tồn tại');
        } else {
            // Lỗi server
            console.error('Lỗi server:', error.message);
        }
        throw error;
    }
}
```

## Best Practices

### 1. Session Management
- Luôn lưu `X-Cart-Session-ID` từ response headers cho guest users
- Không xóa `cartSessionId` khi user đăng xuất để giữ giỏ hàng guest
- Xóa `cartSessionId` chỉ sau khi merge thành công

### 2. Performance
- Cache cart data trong memory để giảm API calls
- Sử dụng debounce cho update quantity operations
- Batch multiple operations nếu có thể

### 3. UX Considerations
- Hiển thị loading state trong các operations
- Provide fallback cho trường hợp API lỗi
- Sync cart count trong UI ngay lập tức

### 4. Security
- Luôn validate token trước khi gọi authenticated APIs
- Handle token expiration gracefully
- Không expose sensitive data trong localStorage

## Example Usage

```javascript
// Khởi tạo cart manager
const cart = new UniversalCart();

// Thêm sản phẩm
await cart.addItem('product-123', 2);

// Cập nhật số lượng
await cart.updateQuantity('product-123', 3);

// Lấy giỏ hàng
const currentCart = await cart.getCart();

// Xử lý đăng nhập
await handleUserLogin();

// Xóa sản phẩm
await cart.removeItem('product-123');
```

Tài liệu này cung cấp tất cả thông tin cần thiết để tích hợp Cart API vào frontend application với hỗ trợ đầy đủ cho cả guest users và authenticated users.
