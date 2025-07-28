# Tài liệu Hướng dẫn Frontend - Quản trị Admin

**Dự án WellVerse E-commerce - Backend API Guide cho Admin Panel**

---

## 📋 Mục lục

1. [Tổng quan hệ thống Admin](#1-tổng-quan-hệ-thống-admin)
2. [Xác thực và Phân quyền](#2-xác-thực-và-phân-quyền)
3. [Dashboard - Trang tổng quan](#3-dashboard---trang-tổng-quan)
4. [Quản lý Sản phẩm](#4-quản-lý-sản-phẩm)
5. [Quản lý Đơn hàng](#5-quản-lý-đơn-hàng)
6. [Quản lý Danh mục](#6-quản-lý-danh-mục)
7. [Quản lý Khuyến mãi](#7-quản-lý-khuyến-mãi)
8. [Quản lý Đánh giá](#8-quản-lý-đánh-giá)
9. [Quản lý Người dùng](#9-quản-lý-người-dùng)
10. [Quản lý Thông báo](#10-quản-lý-thông-báo)
11. [Báo cáo và Thống kê](#11-báo-cáo-và-thống-kê)
12. [Cấu trúc Response chung](#12-cấu-trúc-response-chung)
13. [Xử lý lỗi](#13-xử-lý-lỗi)

---

## 1. Tổng quan hệ thống Admin

### 🎯 Mục đích

Hệ thống Admin Panel của WellVerse được thiết kế để quản lý toàn bộ hoạt động của nhà thuốc trực tuyến, tương tự như các hệ thống quản lý của Long Châu, Pharmacity.

### 🏗️ Kiến trúc

- **Base URL**: `https://api.wellverse.com/api/v1`
- **Authentication**: JWT Bearer Token
- **Authorization**: Role-based (ADMIN role required)
- **Response Format**: JSON với cấu trúc `ApiResponse<T>`

### 🔐 Yêu cầu bảo mật

- Tất cả endpoint admin yêu cầu header `Authorization: Bearer <jwt_token>`
- Role phải là `ADMIN`
- Session timeout: 24 giờ

---

## 2. Xác thực và Phân quyền

### 🔑 Authentication Headers

```javascript
const headers = {
  'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
  'Content-Type': 'application/json'
}
```

### ✅ Kiểm tra quyền Admin

Trước khi gọi bất kỳ API admin nào, frontend cần:

1. Kiểm tra token có tồn tại
2. Decode token để lấy role
3. Verify role = "ADMIN"

```javascript
// Utility function
function isAdmin() {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'ADMIN';
  } catch {
    return false;
  }
}
```

### 🚫 Error Handling cho Unauthorized

```javascript
// Response khi không có quyền
{
  "success": false,
  "message": "Chỉ admin mới có quyền truy cập",
  "data": null
}
```

---

## 3. Dashboard - Trang tổng quan

### 📊 Thống kê tổng quan

**Endpoint**: `GET /admin/dashboard/stats`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy thống kê dashboard thành công",
  "data": {
    "totalOrders": 1250,
    "pendingOrders": 45,
    "totalProducts": 850,
    "totalUsers": 2500,
    "totalRevenue": 15750000.0,
    "todayRevenue": 850000.0,
    "monthlyRevenue": 12500000.0,
    "lastUpdated": "2025-01-15T10:30:00Z"
  }
}
```

**Frontend Implementation**:

```javascript
async function getDashboardStats() {
  try {
    const response = await fetch('/api/v1/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await response.json();
  
    if (result.success) {
      updateDashboardUI(result.data);
    }
  } catch (error) {
    showErrorMessage('Không thể tải thống kê dashboard');
  }
}
```

### 📈 Đơn hàng gần đây

**Endpoint**: `GET /admin/dashboard/recent-orders?limit=10`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng gần đây thành công",
  "data": [
    {
      "orderId": "60f8b2c8e1b2c123456789ab",
      "orderCode": "ORD-2025-001234",
      "customerName": "Nguyễn Văn A",
      "totalAmount": 250000.0,
      "status": "PENDING",
      "createdAt": "2025-01-15T09:30:00Z"
    }
  ]
}
```

### 🏆 Sản phẩm bán chạy

**Endpoint**: `GET /admin/dashboard/top-products?limit=10`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm bán chạy thành công",
  "data": [
    {
      "productId": "60f8b2c8e1b2c123456789ac",
      "productName": "Paracetamol 500mg",
      "quantitySold": 150,
      "revenue": 750000.0,
      "category": "Thuốc giảm đau"
    }
  ]
}
```

---

## 4. Quản lý Sản phẩm

### 📋 Danh sách sản phẩm với bộ lọc

**Endpoint**: `GET /admin/products`

**Query Parameters**:

- `category` (string): Lọc theo danh mục
- `brand` (string): Lọc theo thương hiệu
- `minPrice` (number): Giá tối thiểu
- `maxPrice` (number): Giá tối đa
- `inStock` (boolean): Còn hàng hay không
- `published` (boolean): Đã xuất bản hay không
- `search` (string): Tìm kiếm theo tên

**Example Request**:

```javascript
const params = new URLSearchParams({
  category: 'thuoc-giam-dau',
  inStock: 'true',
  published: 'true',
  search: 'paracetamol'
});

fetch(`/api/v1/admin/products?${params}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 👁️ Chi tiết sản phẩm

**Endpoint**: `GET /admin/products/{id}`

### ➕ Tạo sản phẩm mới

**Endpoint**: `POST /admin/products`

**Request Body**:

```json
{
  "name": "Paracetamol 500mg Hộp 100 viên",
  "slug": "paracetamol-500mg-hop-100-vien",
  "description": "Thuốc giảm đau, hạ sốt",
  "shortDescription": "Giảm đau, hạ sốt hiệu quả",
  "categoryId": "60f8b2c8e1b2c123456789ad",
  "brand": "Teva",
  "sku": "PARA-500-100",
  "price": 25000,
  "salePrice": 22000,
  "stockQuantity": 500,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "specifications": {
    "hoatChat": "Paracetamol",
    "hamLuong": "500mg",
    "dangBaoChe": "Viên nén",
    "dongGoi": "Hộp 100 viên"
  },
  "dosageInstructions": "Uống 1-2 viên mỗi lần, 3-4 lần/ngày",
  "contraindications": "Không dùng cho người dị ứng Paracetamol",
  "sideEffects": "Có thể gây buồn nôn nhẹ",
  "storage": "Bảo quản nơi khô ráo, tránh ánh sáng",
  "prescriptionRequired": false,
  "isPublished": true
}
```

### ✏️ Cập nhật sản phẩm

**Endpoint**: `PUT /admin/products/{id}`

### 🗑️ Xóa sản phẩm

**Endpoint**: `DELETE /admin/products/{id}`

**Frontend Form Example**:

```javascript
// Component form tạo/sửa sản phẩm
const ProductForm = {
  async saveProduct(productData) {
    const method = productData.id ? 'PUT' : 'POST';
    const url = productData.id 
      ? `/api/v1/admin/products/${productData.id}`
      : '/api/v1/admin/products';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
  
      if (result.success) {
        showSuccessMessage('Lưu sản phẩm thành công');
        redirectToProductList();
      } else {
        showErrorMessage(result.message);
      }
    } catch (error) {
      showErrorMessage('Lỗi khi lưu sản phẩm');
    }
  }
};
```

---

## 5. Quản lý Đơn hàng

### 📋 Danh sách đơn hàng

**Endpoint**: `GET /admin/orders`

**Query Parameters**:

- `status` (string): PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED
- `userId` (string): Lọc theo khách hàng
- `startDate` (date): Ngày bắt đầu (yyyy-MM-dd)
- `endDate` (date): Ngày kết thúc (yyyy-MM-dd)
- `search` (string): Tìm theo mã đơn hàng hoặc tên khách

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng với filter thành công",
  "data": [
    {
      "id": "60f8b2c8e1b2c123456789ab",
      "orderCode": "ORD-2025-001234",
      "userId": "60f8b2c8e1b2c123456789aa",
      "customerInfo": {
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0901234567",
        "email": "nguyenvana@email.com"
      },
      "shippingAddress": {
        "recipientName": "Nguyễn Văn A",
        "phoneNumber": "0901234567",
        "address": "123 Đường ABC, Quận 1",
        "ward": "Phường Bến Nghé",
        "district": "Quận 1",
        "province": "TP. Hồ Chí Minh"
      },
      "items": [
        {
          "productId": "60f8b2c8e1b2c123456789ac",
          "productName": "Paracetamol 500mg",
          "quantity": 2,
          "price": 25000,
          "totalPrice": 50000
        }
      ],
      "subtotal": 50000,
      "shippingFee": 30000,
      "totalAmount": 80000,
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "paymentMethod": "COD",
      "notes": "Giao hàng buổi chiều",
      "createdAt": "2025-01-15T09:30:00Z",
      "updatedAt": "2025-01-15T09:30:00Z"
    }
  ]
}
```

### 👁️ Chi tiết đơn hàng

**Endpoint**: `GET /admin/orders/{orderId}`

### 🔍 Tìm đơn hàng theo mã

**Endpoint**: `GET /admin/orders/code/{orderCode}`

### 📝 Cập nhật trạng thái đơn hàng

**Endpoint**: `PATCH /admin/orders/{id}/status`

**Request Body**:

```json
{
  "status": "PROCESSING",
  "notes": "Đã xác nhận đơn hàng, chuẩn bị giao hàng"
}
```

### 💳 Cập nhật trạng thái thanh toán

**Endpoint**: `PUT /admin/orders/{id}/payment-status`

**Request Body**:

```json
{
  "paymentStatus": "PAID"
}
```

### 🗑️ Xóa đơn hàng

**Endpoint**: `DELETE /admin/orders/{id}`

**Frontend Order Management**:

```javascript
const OrderManagement = {
  // Bộ lọc đơn hàng
  async filterOrders(filters) {
    const params = new URLSearchParams();
  
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    const response = await fetch(`/api/v1/admin/orders?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    return await response.json();
  },

  // Cập nhật trạng thái
  async updateOrderStatus(orderId, status, notes) {
    const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, notes })
    });

    return await response.json();
  },

  // Status mapping cho UI
  getStatusBadge(status) {
    const statusMap = {
      'PENDING': { text: 'Chờ xử lý', class: 'badge-warning' },
      'PROCESSING': { text: 'Đang xử lý', class: 'badge-info' },
      'SHIPPED': { text: 'Đã giao', class: 'badge-primary' },
      'COMPLETED': { text: 'Hoàn thành', class: 'badge-success' },
      'CANCELLED': { text: 'Đã hủy', class: 'badge-danger' }
    };
  
    return statusMap[status] || { text: status, class: 'badge-secondary' };
  }
};
```

---

## 6. Quản lý Danh mục

### 👁️ Chi tiết danh mục (Admin)

**Endpoint**: `GET /admin/categories/{id}`

### ➕ Tạo danh mục mới

**Endpoint**: `POST /admin/categories`

**Request Body**:

```json
{
  "name": "Thuốc tim mạch",
  "slug": "thuoc-tim-mach",
  "description": "Các loại thuốc điều trị bệnh tim mạch",
  "parentCategoryId": null,
  "isActive": true,
  "sortOrder": 1,
  "seoTitle": "Thuốc tim mạch chất lượng cao",
  "seoDescription": "Thuốc tim mạch an toàn, hiệu quả từ các thương hiệu uy tín"
}
```

### ✏️ Cập nhật danh mục

**Endpoint**: `PUT /admin/categories/{id}`

### 🗑️ Xóa danh mục

**Endpoint**: `DELETE /admin/categories/{id}`

**Frontend Category Tree**:

```javascript
const CategoryManager = {
  // Render cây danh mục
  renderCategoryTree(categories) {
    return categories.map(category => `
      <div class="category-item" data-id="${category.id}">
        <div class="category-header">
          <span class="category-name">${category.name}</span>
          <div class="category-actions">
            <button onclick="editCategory('${category.id}')">Sửa</button>
            <button onclick="deleteCategory('${category.id}')">Xóa</button>
          </div>
        </div>
        ${category.children ? this.renderCategoryTree(category.children) : ''}
      </div>
    `).join('');
  },

  // Form validation
  validateCategoryForm(data) {
    const errors = [];
  
    if (!data.name?.trim()) errors.push('Tên danh mục không được trống');
    if (!data.slug?.trim()) errors.push('Slug không được trống');
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('Slug chỉ chứa chữ thường, số và dấu gạch ngang');
    }
  
    return errors;
  }
};
```

---

## 7. Quản lý Khuyến mãi

### 📋 Danh sách khuyến mãi

**Endpoint**: `GET /admin/promotions`

### 👁️ Chi tiết khuyến mãi

**Endpoint**: `GET /admin/promotions/{id}`

### ➕ Tạo khuyến mãi

**Endpoint**: `POST /admin/promotions`

**Request Body**:

```json
{
  "title": "Giảm giá 20% thuốc cảm cúm",
  "description": "Áp dụng cho tất cả sản phẩm thuốc cảm cúm",
  "code": "CAMCUM20",
  "type": "PERCENTAGE",
  "value": 20,
  "minimumOrderValue": 100000,
  "maximumDiscountAmount": 50000,
  "usageLimit": 100,
  "usageCount": 0,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "isActive": true,
  "applicableProducts": ["60f8b2c8e1b2c123456789ac"],
  "applicableCategories": ["60f8b2c8e1b2c123456789ad"]
}
```

### ✏️ Cập nhật khuyến mãi

**Endpoint**: `PUT /admin/promotions/{id}`

### 🗑️ Xóa khuyến mãi

**Endpoint**: `DELETE /admin/promotions/{id}`

**Frontend Promotion Manager**:

```javascript
const PromotionManager = {
  // Kiểm tra mã khuyến mãi
  validatePromotionCode(code) {
    return /^[A-Z0-9]{4,10}$/.test(code);
  },

  // Format giá trị giảm giá
  formatDiscountValue(type, value) {
    return type === 'PERCENTAGE' ? `${value}%` : `${value.toLocaleString('vi-VN')}đ`;
  },

  // Kiểm tra thời gian khuyến mãi
  isPromotionActive(startDate, endDate) {
    const now = new Date();
    return new Date(startDate) <= now && now <= new Date(endDate);
  }
};
```

---

## 8. Quản lý Đánh giá

### 📋 Danh sách đánh giá

**Endpoint**: `GET /admin/reviews`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy danh sách đánh giá thành công",
  "data": [
    {
      "id": "60f8b2c8e1b2c123456789ae",
      "productId": "60f8b2c8e1b2c123456789ac",
      "productName": "Paracetamol 500mg",
      "userId": "60f8b2c8e1b2c123456789aa",
      "userName": "Nguyễn Văn A",
      "rating": 5,
      "comment": "Sản phẩm tốt, giao hàng nhanh",
      "adminReply": {
        "responseText": "Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi",
        "repliedAt": "2025-01-15T10:00:00Z"
      },
      "createdAt": "2025-01-15T09:00:00Z"
    }
  ]
}
```

### 💬 Phản hồi đánh giá

**Endpoint**: `PUT /admin/reviews/{id}/reply`

**Request Body**:

```json
{
  "responseText": "Cảm ơn bạn đã đánh giá. Chúng tôi sẽ tiếp tục cải thiện chất lượng sản phẩm."
}
```

### 🗑️ Xóa đánh giá

**Endpoint**: `DELETE /admin/reviews/{id}`

**Frontend Review Management**:

```javascript
const ReviewManager = {
  // Render rating stars
  renderStars(rating) {
    return Array.from({length: 5}, (_, i) => 
      `<span class="star ${i < rating ? 'filled' : 'empty'}">★</span>`
    ).join('');
  },

  // Reply to review
  async replyToReview(reviewId, responseText) {
    const response = await fetch(`/api/v1/admin/reviews/${reviewId}/reply`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ responseText })
    });

    return await response.json();
  }
};
```

---

## 9. Quản lý Người dùng

### 📋 Danh sách người dùng

**Endpoint**: `GET /admin/users`

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": [
    {
      "id": "60f8b2c8e1b2c123456789aa",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phoneNumber": "0901234567",
      "role": "USER",
      "authProvider": "LOCAL",
      "addresses": [
        {
          "id": "addr1",
          "recipientName": "Nguyễn Văn A",
          "phoneNumber": "0901234567",
          "address": "123 Đường ABC",
          "ward": "Phường Bến Nghé",
          "district": "Quận 1",
          "province": "TP. Hồ Chí Minh",
          "isDefault": true
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 🗑️ Xóa người dùng

**Endpoint**: `DELETE /admin/users/{userId}`

**Frontend User Management**:

```javascript
const UserManager = {
  // Format user role
  formatRole(role) {
    const roleMap = {
      'USER': 'Khách hàng',
      'ADMIN': 'Quản trị viên'
    };
    return roleMap[role] || role;
  },

  // Confirm delete user
  async deleteUser(userId, userName) {
    if (confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
  
      if (result.success) {
        showSuccessMessage('Xóa người dùng thành công');
        refreshUserList();
      }
    }
  }
};
```

---

## 10. Quản lý Thông báo

### 📋 Tất cả thông báo (Admin)

**Endpoint**: `GET /admin/notifications`

### 📤 Gửi thông báo

**Endpoint**: `POST /admin/notifications`

**Request Body**:

```json
{
  "title": "Khuyến mãi đặc biệt",
  "message": "Giảm giá 20% tất cả sản phẩm thuốc cảm cúm",
  "type": "PROMOTION",
  "targetUsers": ["60f8b2c8e1b2c123456789aa"],
  "broadcastToAll": false
}
```

### 🗑️ Xóa thông báo

**Endpoint**: `DELETE /admin/notifications/{id}`

---

## 11. Báo cáo và Thống kê

### 💰 Báo cáo doanh thu

**Endpoint**: `GET /admin/reports/revenue`

**Query Parameters**:

- `startDate` (required): Ngày bắt đầu (yyyy-MM-dd)
- `endDate` (required): Ngày kết thúc (yyyy-MM-dd)
- `reportType` (optional): DAILY, WEEKLY, MONTHLY (default: MONTHLY)

**Response Example**:

```json
{
  "success": true,
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "reportType": "MONTHLY",
    "periodStart": "2025-01-01T00:00:00Z",
    "periodEnd": "2025-01-31T23:59:59Z",
    "totalRevenue": 15750000.0,
    "totalOrders": 350,
    "topProducts": [
      {
        "productId": "60f8b2c8e1b2c123456789ac",
        "productName": "Paracetamol 500mg",
        "quantitySold": 150,
        "revenue": 750000.0
      }
    ],
    "generatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### 📊 Báo cáo hiệu suất sản phẩm

**Endpoint**: `GET /admin/reports/products`

### 📈 Thống kê đơn hàng

**Endpoint**: `GET /admin/reports/orders`

### 👥 Phân tích người dùng

**Endpoint**: `GET /admin/reports/users`

**Frontend Report Dashboard**:

```javascript
const ReportManager = {
  // Tạo biểu đồ doanh thu
  async renderRevenueChart(startDate, endDate) {
    const response = await fetch(
      `/api/v1/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  
    const result = await response.json();
  
    if (result.success) {
      // Use Chart.js or similar library
      this.createChart('revenue-chart', result.data);
    }
  },

  // Export báo cáo
  async exportReport(type, startDate, endDate) {
    const response = await fetch(
      `/api/v1/admin/reports/${type}?startDate=${startDate}&endDate=${endDate}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
  
    const result = await response.json();
  
    // Convert to Excel/PDF
    this.downloadAsExcel(result.data, `${type}-report-${startDate}-${endDate}.xlsx`);
  }
};
```

---

## 12. Cấu trúc Response chung

### ✅ Response thành công

```json
{
  "success": true,
  "message": "Thông điệp thành công",
  "data": { /* Dữ liệu response */ }
}
```

### ❌ Response lỗi

```json
{
  "success": false,
  "message": "Thông điệp lỗi",
  "data": null
}
```

### 📄 Response có phân trang

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {
    "content": [ /* Mảng dữ liệu */ ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false
  }
}
```

---

## 13. Xử lý lỗi

### 🔐 Lỗi xác thực (401)

```javascript
// Interceptor cho tất cả request
const apiInterceptor = {
  async request(config) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  async response(response) {
    if (response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('accessToken');
      window.location.href = '/admin/login';
    }
    return response;
  }
};
```

### 🚫 Lỗi phân quyền (403)

```javascript
if (response.status === 403) {
  showErrorMessage('Bạn không có quyền thực hiện hành động này');
  // Redirect về dashboard hoặc trang trước
}
```

### 🔍 Lỗi không tìm thấy (404)

```javascript
if (response.status === 404) {
  showErrorMessage('Không tìm thấy dữ liệu yêu cầu');
}
```

### ⚠️ Lỗi validation (400)

```javascript
if (response.status === 400) {
  const result = await response.json();
  showValidationErrors(result.message);
}
```

### 🔧 Lỗi server (500)

```javascript
if (response.status >= 500) {
  showErrorMessage('Lỗi hệ thống, vui lòng thử lại sau');
}
```

---

## 📋 Checklist Implementation

### 🎯 Phase 1: Core Admin Features

- [ ] Authentication & Authorization
- [ ] Dashboard Overview
- [ ] Product Management (CRUD)
- [ ] Order Management (View, Update Status)
- [ ] Basic Error Handling

### 🎯 Phase 2: Advanced Features

- [ ] Category Management
- [ ] Promotion Management
- [ ] Review Management
- [ ] User Management
- [ ] Notification System

### 🎯 Phase 3: Analytics & Reports

- [ ] Revenue Reports
- [ ] Product Performance
- [ ] Order Statistics
- [ ] User Analytics
- [ ] Export Functionality

### 🎯 Phase 4: UX Enhancements

- [ ] Advanced Filters
- [ ] Bulk Operations
- [ ] Real-time Updates
- [ ] Mobile Responsive
- [ ] Performance Optimization

---

## 🔗 API Endpoints Summary

| Module                  | Method | Endpoint                              | Description               |
| ----------------------- | ------ | ------------------------------------- | ------------------------- |
| **Dashboard**     | GET    | `/admin/dashboard/stats`            | Thống kê tổng quan     |
|                         | GET    | `/admin/dashboard/recent-orders`    | Đơn hàng gần đây    |
|                         | GET    | `/admin/dashboard/top-products`     | Sản phẩm bán chạy     |
| **Products**      | GET    | `/admin/products`                   | Danh sách sản phẩm     |
|                         | GET    | `/admin/products/{id}`              | Chi tiết sản phẩm      |
|                         | POST   | `/admin/products`                   | Tạo sản phẩm           |
|                         | PUT    | `/admin/products/{id}`              | Cập nhật sản phẩm     |
|                         | DELETE | `/admin/products/{id}`              | Xóa sản phẩm           |
| **Orders**        | GET    | `/admin/orders`                     | Danh sách đơn hàng    |
|                         | GET    | `/admin/orders/{id}`                | Chi tiết đơn hàng     |
|                         | GET    | `/admin/orders/code/{code}`         | Tìm theo mã đơn       |
|                         | PATCH  | `/admin/orders/{id}/status`         | Cập nhật trạng thái   |
|                         | PUT    | `/admin/orders/{id}/payment-status` | Cập nhật thanh toán    |
|                         | DELETE | `/admin/orders/{id}`                | Xóa đơn hàng          |
| **Categories**    | GET    | `/admin/categories/{id}`            | Chi tiết danh mục       |
|                         | POST   | `/admin/categories`                 | Tạo danh mục            |
|                         | PUT    | `/admin/categories/{id}`            | Cập nhật danh mục      |
|                         | DELETE | `/admin/categories/{id}`            | Xóa danh mục            |
| **Promotions**    | GET    | `/admin/promotions`                 | Danh sách khuyến mãi   |
|                         | GET    | `/admin/promotions/{id}`            | Chi tiết khuyến mãi    |
|                         | POST   | `/admin/promotions`                 | Tạo khuyến mãi         |
|                         | PUT    | `/admin/promotions/{id}`            | Cập nhật khuyến mãi   |
|                         | DELETE | `/admin/promotions/{id}`            | Xóa khuyến mãi         |
| **Reviews**       | GET    | `/admin/reviews`                    | Danh sách đánh giá    |
|                         | PUT    | `/admin/reviews/{id}/reply`         | Phản hồi đánh giá    |
|                         | DELETE | `/admin/reviews/{id}`               | Xóa đánh giá          |
| **Users**         | GET    | `/admin/users`                      | Danh sách người dùng  |
|                         | DELETE | `/admin/users/{id}`                 | Xóa người dùng        |
| **Notifications** | GET    | `/admin/notifications`              | Danh sách thông báo    |
|                         | POST   | `/admin/notifications`              | Gửi thông báo          |
|                         | DELETE | `/admin/notifications/{id}`         | Xóa thông báo          |
| **Reports**       | GET    | `/admin/reports/revenue`            | Báo cáo doanh thu       |
|                         | GET    | `/admin/reports/products`           | Hiệu suất sản phẩm    |
|                         | GET    | `/admin/reports/orders`             | Thống kê đơn hàng    |
|                         | GET    | `/admin/reports/users`              | Phân tích người dùng |

---

## 🏥 Nghiệp vụ đặc thù Nhà thuốc

### 💊 Quản lý Thuốc kê đơn

- Kiểm tra `prescriptionRequired` trong sản phẩm
- Yêu cầu upload đơn thuốc cho đơn hàng có thuốc kê đơn
- Phê duyệt đơn hàng thuốc kê đơn bởi Dược sĩ

### 📅 Quản lý Hạn sử dụng

- Theo dõi ngày hết hạn sản phẩm
- Cảnh báo sản phẩm sắp hết hạn
- Báo cáo sản phẩm cần thanh lý

### 🏥 Tích hợp với Hệ thống Y tế

- Kết nối với hệ thống bệnh viện
- Đồng bộ đơn thuốc điện tử
- Tra cứu thông tin bệnh nhân

### 📱 Tính năng đặc biệt

- Tư vấn trực tuyến với Dược sĩ
- Nhắc nhở uống thuốc
- Lịch sử sử dụng thuốc của khách hàng

---

**📞 Hỗ trợ kỹ thuật**: [your-email@domain.com]
**📚 Documentation**: [https://api-docs.wellverse.com]
**🐛 Bug Report**: [https://github.com/wellverse/issues]

---

*Tài liệu được cập nhật lần cuối: 15/01/2025*
