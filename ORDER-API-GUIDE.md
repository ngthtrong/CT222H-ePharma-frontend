# Hướng Dẫn Sử Dụng Order API cho Frontend

## Tổng Quan

API Order hỗ trợ đầy đủ quy trình quản lý đơn hàng từ việc tạo, xem, hủy, đến quản lý và xác nhận cho cả **User** và **Admin**. Hệ thống sử dụng JWT token để xác thực và phân quyền.

- **User**: Có thể tạo đơn hàng, xem lịch sử đơn hàng, xem chi tiết và hủy đơn hàng của mình
- **Admin**: Có thể quản lý tất cả đơn hàng, cập nhật trạng thái, xử lý thanh toán và xóa đơn hàng

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication & Authorization

### User Authentication
```javascript
const headers = {
    'Authorization': 'Bearer <JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

### Admin Authentication
```javascript
const headers = {
    'Authorization': 'Bearer <ADMIN_JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

## Order Status & Payment Status

### Order Status
- `PENDING`: Đang chờ xử lý
- `PROCESSING`: Đang xử lý
- `SHIPPED`: Đã giao cho đơn vị vận chuyển
- `COMPLETED`: Hoàn thành
- `CANCELLED`: Đã hủy

### Payment Status
- `UNPAID`: Chưa thanh toán
- `PAID`: Đã thanh toán

### Payment Methods
- `COD`: Thanh toán khi nhận hàng
- `MOMO`: Thanh toán qua Momo
- `BANK_TRANSFER`: Chuyển khoản ngân hàng

---

## USER API ENDPOINTS

### 1. Lấy Lịch Sử Đơn Hàng Của User

**GET** `/orders`

**Mô tả**: Lấy tất cả đơn hàng của user hiện tại

```javascript
async function getUserOrders() {
    const response = await fetch('/api/v1/orders', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of OrderResponse
}
```

**Response Example**:
```json
{
    "success": true,
    "message": "Lấy danh sách đơn hàng thành công",
    "data": [
        {
            "id": "order_001",
            "orderCode": "ORD-20250131-001",
            "userId": "user_123",
            "userName": "Nguyễn Văn A",
            "shippingAddress": {
                "sourceAddressId": "addr_001",
                "recipientName": "Nguyễn Văn A",
                "phoneNumber": "0901234567",
                "street": "123 Đường ABC",
                "ward": "Phường 1",
                "city": "TP. Hồ Chí Minh"
            },
            "items": [
                {
                    "productId": "prod_001",
                    "productName": "Vitamin C 1000mg",
                    "priceAtPurchase": 150000.0,
                    "quantity": 2,
                    "itemTotal": 300000.0
                }
            ],
            "subtotal": 300000.0,
            "shippingFee": 30000.0,
            "totalAmount": 330000.0,
            "status": "PENDING",
            "paymentMethod": "COD",
            "paymentStatus": "UNPAID",
            "notes": "Giao hàng nhanh",
            "trackingNumber": null,
            "cancelReason": null,
            "cancelledAt": null,
            "createdAt": "2025-01-31T10:30:00Z",
            "updatedAt": "2025-01-31T10:30:00Z"
        }
    ]
}
```

### 2. Lấy Chi Tiết Đơn Hàng Theo Mã

**GET** `/orders/{orderCode}`

**Mô tả**: Lấy chi tiết đơn hàng cụ thể của user theo mã đơn hàng

```javascript
async function getUserOrderByCode(orderCode) {
    const response = await fetch(`/api/v1/orders/${orderCode}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // OrderResponse object
}
```

### 3. Tạo Đơn Hàng Mới

**POST** `/orders`

**Mô tả**: Tạo đơn hàng mới từ giỏ hàng hiện tại

**Request Body**:
```json
{
    "selectedAddressId": "addr_001", // ID của địa chỉ đã lưu (tùy chọn)
    "customShippingAddress": { // Địa chỉ tùy chỉnh (tùy chọn)
        "recipientName": "Nguyễn Văn B",
        "phoneNumber": "0987654321",
        "street": "456 Đường XYZ",
        "ward": "Phường 2",
        "city": "Hà Nội",
        "saveAsNewAddress": true, // Lưu làm địa chỉ mới
        "setAsDefault": false // Đặt làm địa chỉ mặc định
    },
    "paymentMethod": "COD", // COD, MOMO, BANK_TRANSFER
    "notes": "Giao hàng trong giờ hành chính"
}
```

```javascript
async function createOrder(orderData) {
    const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    return data.data; // Created OrderResponse
}
```

**Lưu ý về địa chỉ giao hàng**:
- Nếu không truyền cả `selectedAddressId` và `customShippingAddress`: Sử dụng địa chỉ mặc định
- Nếu truyền `selectedAddressId`: Sử dụng địa chỉ đã lưu có ID tương ứng
- Nếu truyền `customShippingAddress`: Sử dụng địa chỉ tùy chỉnh

### 4. Hủy Đơn Hàng

**PATCH** `/orders/{orderCode}/cancel`

**Mô tả**: Hủy đơn hàng (chỉ được phép hủy đơn hàng ở trạng thái PENDING hoặc PROCESSING)

**Request Body**:
```json
{
    "reason": "Thay đổi địa chỉ giao hàng"
}
```

```javascript
async function cancelOrder(orderCode, reason) {
    const response = await fetch(`/api/v1/orders/${orderCode}/cancel`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
    });
    
    const data = await response.json();
    return data.data; // Updated OrderResponse
}
```

---

## ADMIN API ENDPOINTS

### 1. Lấy Danh Sách Tất Cả Đơn Hàng (Có Bộ Lọc)

**GET** `/admin/orders`

**Query Parameters**:
- `status`: Lọc theo trạng thái (PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED)
- `userId`: Lọc theo khách hàng
- `startDate`: Ngày bắt đầu (yyyy-MM-dd)
- `endDate`: Ngày kết thúc (yyyy-MM-dd)
- `search`: Tìm kiếm theo mã đơn hàng hoặc tên người nhận

```javascript
async function getAllOrdersAdmin(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            params.append(key, filters[key]);
        }
    });
    
    const response = await fetch(`/api/v1/admin/orders?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of OrderResponse
}

// Examples
await getAllOrdersAdmin({ status: 'PENDING' });
await getAllOrdersAdmin({ userId: 'user_123', startDate: '2025-01-01' });
await getAllOrdersAdmin({ search: 'ORD-20250131' });
```

### 2. Lấy Chi Tiết Đơn Hàng Theo ID

**GET** `/admin/orders/{orderId}`

```javascript
async function getOrderByIdAdmin(orderId) {
    const response = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // OrderResponse
}
```

### 3. Lấy Chi Tiết Đơn Hàng Theo Mã

**GET** `/admin/orders/code/{orderCode}`

```javascript
async function getOrderByCodeAdmin(orderCode) {
    const response = await fetch(`/api/v1/admin/orders/code/${orderCode}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // OrderResponse
}
```

### 4. Cập Nhật Trạng Thái Đơn Hàng

**PATCH** `/admin/orders/{id}/status`

**Request Body**:
```json
{
    "status": "PROCESSING", // PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED
    "notes": "Đã xác nhận đơn hàng, chuẩn bị giao hàng"
}
```

```javascript
async function updateOrderStatus(orderId, status, notes = null) {
    const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
    });
    
    const data = await response.json();
    return data.data; // Updated OrderResponse
}
```

### 5. Cập Nhật Trạng Thái Thanh Toán

**PUT** `/admin/orders/{id}/payment-status`

**Query Parameter**: `paymentStatus=PAID` hoặc `paymentStatus=UNPAID`

```javascript
async function updatePaymentStatus(orderId, paymentStatus) {
    const response = await fetch(`/api/v1/admin/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Updated OrderResponse
}
```

### 6. Xóa Đơn Hàng

**DELETE** `/admin/orders/{id}`

```javascript
async function deleteOrder(orderId) {
    const response = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.success; // Boolean
}
```

---

## Response Data Structure

### OrderResponse Structure
```json
{
    "id": "string",
    "orderCode": "string",
    "userId": "string",
    "userName": "string",
    "shippingAddress": {
        "sourceAddressId": "string",
        "recipientName": "string",
        "phoneNumber": "string",
        "street": "string",
        "ward": "string",
        "city": "string"
    },
    "items": [
        {
            "productId": "string",
            "productName": "string",
            "priceAtPurchase": "number",
            "quantity": "number",
            "itemTotal": "number"
        }
    ],
    "subtotal": "number",
    "shippingFee": "number",
    "totalAmount": "number",
    "status": "string",
    "paymentMethod": "string",
    "paymentStatus": "string",
    "notes": "string",
    "trackingNumber": "string",
    "cancelReason": "string",
    "cancelledAt": "ISO8601 string",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string"
}
```

---

## Workflow Logic cho Frontend

### 1. Order Management Class

```javascript
class OrderManager {
    constructor(token, isAdmin = false) {
        this.token = token;
        this.isAdmin = isAdmin;
        this.baseURL = '/api/v1';
    }
    
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
    
    // User methods
    async getUserOrders() {
        if (this.isAdmin) throw new Error('Use admin methods for admin users');
        return await this.makeRequest('GET', '/orders');
    }
    
    async getUserOrder(orderCode) {
        if (this.isAdmin) throw new Error('Use admin methods for admin users');
        return await this.makeRequest('GET', `/orders/${orderCode}`);
    }
    
    async createOrder(orderData) {
        if (this.isAdmin) throw new Error('Use admin methods for admin users');
        return await this.makeRequest('POST', '/orders', orderData);
    }
    
    async cancelOrder(orderCode, reason) {
        if (this.isAdmin) throw new Error('Use admin methods for admin users');
        return await this.makeRequest('PATCH', `/orders/${orderCode}/cancel`, { reason });
    }
    
    // Admin methods
    async getAllOrders(filters = {}) {
        if (!this.isAdmin) throw new Error('Admin access required');
        const params = new URLSearchParams(filters);
        return await this.makeRequest('GET', `/admin/orders?${params}`);
    }
    
    async getOrderById(orderId) {
        if (!this.isAdmin) throw new Error('Admin access required');
        return await this.makeRequest('GET', `/admin/orders/${orderId}`);
    }
    
    async getOrderByCode(orderCode) {
        if (!this.isAdmin) throw new Error('Admin access required');
        return await this.makeRequest('GET', `/admin/orders/code/${orderCode}`);
    }
    
    async updateOrderStatus(orderId, status, notes = null) {
        if (!this.isAdmin) throw new Error('Admin access required');
        return await this.makeRequest('PATCH', `/admin/orders/${orderId}/status`, { status, notes });
    }
    
    async updatePaymentStatus(orderId, paymentStatus) {
        if (!this.isAdmin) throw new Error('Admin access required');
        return await this.makeRequest('PUT', `/admin/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`);
    }
    
    async deleteOrder(orderId) {
        if (!this.isAdmin) throw new Error('Admin access required');
        return await this.makeRequest('DELETE', `/admin/orders/${orderId}`);
    }
    
    // Helper method
    async makeRequest(method, endpoint, body = null) {
        const config = {
            method,
            headers: this.getHeaders()
        };
        
        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data.data;
    }
}
```

### 2. Order Status Management

```javascript
const OrderStatusManager = {
    statusFlow: {
        'PENDING': ['PROCESSING', 'CANCELLED'],
        'PROCESSING': ['SHIPPED', 'CANCELLED'],
        'SHIPPED': ['COMPLETED'],
        'COMPLETED': [],
        'CANCELLED': []
    },
    
    canTransitionTo(currentStatus, newStatus) {
        return this.statusFlow[currentStatus]?.includes(newStatus) || false;
    },
    
    getAvailableStatuses(currentStatus) {
        return this.statusFlow[currentStatus] || [];
    },
    
    getStatusLabel(status) {
        const labels = {
            'PENDING': 'Chờ xử lý',
            'PROCESSING': 'Đang xử lý',
            'SHIPPED': 'Đang giao',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy'
        };
        return labels[status] || status;
    },
    
    getStatusColor(status) {
        const colors = {
            'PENDING': '#ffa500',
            'PROCESSING': '#2196f3',
            'SHIPPED': '#9c27b0',
            'COMPLETED': '#4caf50',
            'CANCELLED': '#f44336'
        };
        return colors[status] || '#666';
    }
};
```

### 3. Create Order Flow

```javascript
const CreateOrderFlow = {
    async createOrderFromCart(orderData) {
        try {
            // Validate cart has items
            const cart = await CartManager.getCart();
            if (!cart.items || cart.items.length === 0) {
                throw new Error('Giỏ hàng trống');
            }
            
            // Validate address
            if (!orderData.selectedAddressId && !orderData.customShippingAddress) {
                // Use default address
                const user = await UserManager.getProfile();
                const defaultAddress = user.addresses?.find(addr => addr.isDefault);
                if (!defaultAddress) {
                    throw new Error('Vui lòng chọn địa chỉ giao hàng');
                }
            }
            
            // Create order
            const order = await OrderManager.createOrder(orderData);
            
            // Clear cart after successful order creation
            await CartManager.clearCart();
            
            return order;
        } catch (error) {
            console.error('Create order failed:', error);
            throw error;
        }
    }
};
```

### 4. Admin Order Management

```javascript
const AdminOrderManager = {
    async processOrder(orderId) {
        try {
            // Update status to PROCESSING
            const updated = await OrderManager.updateOrderStatus(orderId, 'PROCESSING', 'Đã xác nhận đơn hàng');
            
            // Send notification to user
            await NotificationManager.sendOrderStatusUpdate(updated.userId, updated.orderCode, 'PROCESSING');
            
            return updated;
        } catch (error) {
            console.error('Process order failed:', error);
            throw error;
        }
    },
    
    async shipOrder(orderId, trackingNumber) {
        try {
            // Update status to SHIPPED
            const updated = await OrderManager.updateOrderStatus(orderId, 'SHIPPED', `Đơn hàng đã được giao cho đơn vị vận chuyển. Mã vận đơn: ${trackingNumber}`);
            
            // Update tracking number if available
            // Note: This would require an additional API endpoint for tracking number
            
            return updated;
        } catch (error) {
            console.error('Ship order failed:', error);
            throw error;
        }
    }
};
```

---

## Error Handling

### Common Error Codes

```javascript
const OrderErrorHandler = {
    handleError(error, context = '') {
        const errorMessages = {
            400: 'Dữ liệu không hợp lệ',
            401: 'Vui lòng đăng nhập lại',
            403: 'Bạn không có quyền thực hiện thao tác này',
            404: 'Không tìm thấy đơn hàng',
            500: 'Lỗi hệ thống, vui lòng thử lại sau'
        };
        
        const message = errorMessages[error.status] || error.message || 'Có lỗi xảy ra';
        
        console.error(`Order API Error ${context}:`, error);
        
        // Show user-friendly error message
        this.showErrorMessage(message);
        
        return message;
    },
    
    showErrorMessage(message) {
        // Implementation depends on your UI framework
        // Example: toast notification, modal, etc.
        console.error('Order Error:', message);
    }
};
```

---

## Best Practices

### 1. Order State Management
- Cache order list để giảm API calls
- Sử dụng real-time updates cho order status changes
- Implement optimistic updates cho better UX

### 2. Security
- Luôn validate quyền truy cập ở frontend
- Không expose sensitive order data
- Handle token expiration gracefully

### 3. Performance
- Implement pagination cho order list
- Use debounce cho search và filter
- Cache frequently accessed orders

### 4. UX Considerations
- Hiển thị loading states cho tất cả operations
- Provide clear error messages
- Show order progress visually
- Allow bulk operations cho admin

### 5. Validation
- Validate order data trước khi submit
- Check order status transitions
- Ensure cart has items before creating order

---

## Example Usage

```javascript
// Initialize managers
const userOrderManager = new OrderManager(userToken, false);
const adminOrderManager = new OrderManager(adminToken, true);

// User operations
const userOrders = await userOrderManager.getUserOrders();
const orderDetail = await userOrderManager.getUserOrder('ORD-20250131-001');

// Create new order
const newOrder = await CreateOrderFlow.createOrderFromCart({
    selectedAddressId: 'addr_001',
    paymentMethod: 'COD',
    notes: 'Giao hàng buổi chiều'
});

// Cancel order
await userOrderManager.cancelOrder('ORD-20250131-001', 'Thay đổi địa chỉ');

// Admin operations
const allOrders = await adminOrderManager.getAllOrders({ status: 'PENDING' });
await AdminOrderManager.processOrder('order_001');
await adminOrderManager.updatePaymentStatus('order_001', 'PAID');
```

Tài liệu này cung cấp tất cả thông tin cần thiết để tích hợp Order API vào frontend application với hỗ trợ đầy đủ cho cả user và admin operations, từ việc tạo đơn hàng đến quản lý và xác nhận đơn hàng.
