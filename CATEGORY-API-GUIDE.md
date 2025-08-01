# CATEGORY API GUIDE

Hướng dẫn sử dụng các API endpoint để quản lý danh mục sản phẩm trong hệ thống Vegeta Backend.

## Base URL
```
http://localhost:8081/api/v1
```

## Authentication
- **PUBLIC ENDPOINTS**: Không yêu cầu xác thực
- **ADMIN ENDPOINTS**: Yêu cầu JWT token với role ADMIN

### Headers cho ADMIN endpoints:
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## PUBLIC ENDPOINTS

### 1. Lấy tất cả danh mục
Lấy danh sách tất cả danh mục trong hệ thống.

**Endpoint:**
```
GET /categories
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Điện thoại thông minh và phụ kiện",
      "parentCategoryId": null,
      "parentCategoryName": "Danh mục gốc",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Lấy danh mục gốc
Lấy danh sách các danh mục gốc (không có danh mục cha).

**Endpoint:**
```
GET /categories/root
```

**Response:** Tương tự như endpoint lấy tất cả danh mục, nhưng chỉ trả về các danh mục gốc.

### 3. Tìm kiếm danh mục
Tìm kiếm danh mục theo từ khóa.

**Endpoint:**
```
GET /categories/search?q={keyword}
```

**Parameters:**
- `q` (required): Từ khóa tìm kiếm

**Example:**
```
GET /categories/search?q=điện thoại
```

**Response:**
```json
{
  "success": true,
  "message": "Tìm kiếm danh mục thành công",
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Điện thoại",
      "slug": "dien-thoai",
      "description": "Điện thoại thông minh và phụ kiện",
      "parentCategoryId": null,
      "parentCategoryName": "Danh mục gốc",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Lấy danh mục theo slug
Lấy thông tin chi tiết một danh mục dựa vào slug.

**Endpoint:**
```
GET /categories/{slug}
```

**Example:**
```
GET /categories/dien-thoai
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh mục thành công",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Điện thoại thông minh và phụ kiện",
    "parentCategoryId": null,
    "parentCategoryName": "Danh mục gốc",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Lấy danh mục con
Lấy danh sách các danh mục con của một danh mục.

**Endpoint:**
```
GET /categories/{id}/children
```

**Example:**
```
GET /categories/64f1a2b3c4d5e6f7g8h9i0j1/children
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách danh mục con thành công",
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "iPhone",
      "slug": "iphone",
      "description": "Các sản phẩm iPhone của Apple",
      "parentCategoryId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "parentCategoryName": "Điện thoại",
      "createdAt": "2024-01-15T11:00:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## ADMIN ENDPOINTS

### 1. Lấy danh mục theo ID (Admin)
Lấy thông tin chi tiết một danh mục dựa vào ID (chỉ dành cho Admin).

**Endpoint:**
```
GET /admin/categories/{id}
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Example:**
```
GET /admin/categories/64f1a2b3c4d5e6f7g8h9i0j1
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh mục thành công",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Điện thoại thông minh và phụ kiện",
    "parentCategoryId": null,
    "parentCategoryName": "Danh mục gốc",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Tạo danh mục mới
Tạo một danh mục mới trong hệ thống.

**Endpoint:**
```
POST /admin/categories
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Laptop",
  "slug": "laptop",
  "description": "Máy tính xách tay và phụ kiện",
  "parentCategoryId": null
}
```

**Field Validation:**
- `name`: Bắt buộc, tối đa 100 ký tự
- `slug`: Bắt buộc, tối đa 100 ký tự, phải duy nhất
- `description`: Không bắt buộc, tối đa 255 ký tự
- `parentCategoryId`: Không bắt buộc, ID của danh mục cha

**Success Response (201):**
```json
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "name": "Laptop",
    "slug": "laptop",
    "description": "Máy tính xách tay và phụ kiện",
    "parentCategoryId": null,
    "parentCategoryName": "Danh mục gốc",
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Slug đã tồn tại, vui lòng chọn slug khác",
  "data": null
}
```

### 3. Cập nhật danh mục
Cập nhật thông tin của một danh mục đã tồn tại.

**Endpoint:**
```
PUT /admin/categories/{id}
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Laptop Gaming",
  "slug": "laptop-gaming",
  "description": "Máy tính xách tay dành cho game thủ",
  "parentCategoryId": "64f1a2b3c4d5e6f7g8h9i0j3"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cập nhật danh mục thành công",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "name": "Laptop Gaming",
    "slug": "laptop-gaming",
    "description": "Máy tính xách tay dành cho game thủ",
    "parentCategoryId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "parentCategoryName": "Laptop",
    "createdAt": "2024-01-15T12:30:00Z",
    "updatedAt": "2024-01-15T13:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy danh mục",
  "data": null
}
```

### 4. Xóa danh mục
Xóa một danh mục khỏi hệ thống.

**Endpoint:**
```
DELETE /admin/categories/{id}
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Example:**
```
DELETE /admin/categories/64f1a2b3c4d5e6f7g8h9i0j4
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Xóa danh mục thành công",
  "data": null
}
```

**Error Response (400) - Có danh mục con:**
```json
{
  "success": false,
  "message": "Không thể xóa danh mục có danh mục con",
  "data": null
}
```

**Error Response (400) - Có sản phẩm:**
```json
{
  "success": false,
  "message": "Không thể xóa danh mục có sản phẩm",
  "data": null
}
```

---

## Error Handling

### Common Error Responses

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "data": null
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Không có quyền truy cập",
  "data": null
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Tên danh mục không được để trống",
  "data": null
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy danh mục",
  "data": null
}
```

---

## Usage Examples

### Example 1: Tạo cấu trúc danh mục phân cấp

1. **Tạo danh mục gốc "Công nghệ":**
```bash
curl -X POST http://localhost:8081/api/v1/admin/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Công nghệ",
    "slug": "cong-nghe",
    "description": "Sản phẩm công nghệ",
    "parentCategoryId": null
  }'
```

2. **Tạo danh mục con "Điện thoại":**
```bash
curl -X POST http://localhost:8081/api/v1/admin/categories \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Điện thoại",
    "slug": "dien-thoai",
    "description": "Điện thoại di động",
    "parentCategoryId": "64f1a2b3c4d5e6f7g8h9i0j1"
  }'
```

### Example 2: Lấy cấu trúc danh mục cho frontend

```bash
# Lấy tất cả danh mục gốc
curl -X GET http://localhost:8081/api/v1/categories/root

# Với mỗi danh mục gốc, lấy danh mục con
curl -X GET http://localhost:8081/api/v1/categories/{category-id}/children
```

### Example 3: Tìm kiếm và filter

```bash
# Tìm kiếm danh mục
curl -X GET "http://localhost:8081/api/v1/categories/search?q=điện%20thoại"

# Lấy danh mục theo slug
curl -X GET http://localhost:8081/api/v1/categories/dien-thoai
```

---

## Best Practices

### 1. Slug Management
- Slug phải là duy nhất trong toàn hệ thống
- Sử dụng format lowercase với dấu gạch ngang (kebab-case)
- Ví dụ: "dien-thoai-thong-minh", "laptop-gaming"

### 2. Hierarchy Design
- Giới hạn độ sâu của cây danh mục (khuyến nghị tối đa 3-4 cấp)
- Tránh tạo tham chiếu vòng tròn trong cấu trúc danh mục

### 3. Error Handling
- Luôn kiểm tra response status và message
- Xử lý các trường hợp danh mục có danh mục con hoặc sản phẩm khi xóa

### 4. Frontend Integration
- Sử dụng endpoint `/categories/root` để tạo menu navigation
- Sử dụng endpoint `/categories/{id}/children` để tạo dropdown/submenu
- Cache danh mục ở client để tối ưu hiệu suất

---

## Notes

- Tất cả timestamps sử dụng format ISO 8601 UTC
- ID sử dụng MongoDB ObjectId format
- API hỗ trợ CORS cho phép tích hợp với frontend
- Dữ liệu response được wrap trong object ApiResponse để đồng nhất format
