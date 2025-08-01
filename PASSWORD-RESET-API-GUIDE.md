# Password Reset API Guide

## Mô tả tổng quan
Bộ API để xử lý quên mật khẩu và đặt lại mật khẩu cho người dùng. Hệ thống sử dụng token có thời hạn để đảm bảo bảo mật.

## Base URL
```
http://localhost:8080/api/v1/auth
```

## Danh sách API

### 1. Forgot Password - Yêu cầu đặt lại mật khẩu
**POST** `/forgot-password`

#### Mô tả
API này cho phép người dùng yêu cầu đặt lại mật khẩu bằng cách cung cấp email. Hệ thống sẽ tạo token đặt lại mật khẩu có thời hạn 1 giờ.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
    "email": "user@example.com"
}
```

#### Validation Rules
- `email`: Bắt buộc, phải đúng định dạng email

#### Response Success (200)
```json
{
    "success": true,
    "message": "Yêu cầu đặt lại mật khẩu đã được xử lý",
    "data": {
        "message": "Mã đặt lại mật khẩu đã được tạo. Token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (Có hiệu lực trong 1 giờ)",
        "success": true
    }
}
```

#### Response Error (404)
```json
{
    "success": false,
    "message": "Không tìm thấy tài khoản với email này.",
    "data": null
}
```

#### Response Error (400)
```json
{
    "success": false,
    "message": "Email không được để trống",
    "data": null
}
```

### 2. Reset Password - Đặt lại mật khẩu
**POST** `/reset-password`

#### Mô tả
API này cho phép người dùng đặt lại mật khẩu mới bằng token nhận được từ API forgot-password.

#### Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
    "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "newPassword": "newPassword123"
}
```

#### Validation Rules
- `token`: Bắt buộc, không được để trống
- `newPassword`: Bắt buộc, tối thiểu 6 ký tự

#### Response Success (200)
```json
{
    "success": true,
    "message": "Đặt lại mật khẩu thành công",
    "data": {
        "message": "Mật khẩu đã được đặt lại thành công.",
        "success": true
    }
}
```

#### Response Error (400) - Token không hợp lệ
```json
{
    "success": false,
    "message": "Token không hợp lệ.",
    "data": null
}
```

#### Response Error (400) - Token đã hết hạn
```json
{
    "success": false,
    "message": "Token đã hết hạn hoặc đã được sử dụng.",
    "data": null
}
```

#### Response Error (400) - Validation
```json
{
    "success": false,
    "message": "Mật khẩu phải có ít nhất 6 ký tự",
    "data": null
}
```

## Cấu trúc Database

### Collection: password_reset_tokens
```json
{
    "_id": "ObjectId",
    "userId": "string",
    "token": "string (unique)",
    "expiryDate": "LocalDateTime",
    "used": "boolean",
    "createdAt": "LocalDateTime"
}
```

## Quy trình sử dụng

1. **Yêu cầu đặt lại mật khẩu:**
   - Người dùng gọi API `/forgot-password` với email
   - Hệ thống tạo token có thời hạn 1 giờ
   - Token được trả về trong response (trong thực tế nên gửi qua email)

2. **Đặt lại mật khẩu:**
   - Người dùng sử dụng token để gọi API `/reset-password`
   - Hệ thống kiểm tra token có hợp lệ và chưa hết hạn
   - Cập nhật mật khẩu mới và đánh dấu token đã sử dụng

## Bảo mật
- Token có thời hạn 1 giờ
- Token chỉ sử dụng được 1 lần
- Mật khẩu được mã hóa bằng BCrypt
- Token cũ sẽ bị xóa khi tạo token mới

## Ghi chú
- Trong môi trường production, token nên được gửi qua email thay vì trả về trong response
- Có thể thêm rate limiting để tránh spam
- Có thể thêm log để theo dõi các hoạt động đặt lại mật khẩu

## Testing với Postman

### Test Forgot Password
```bash
POST http://localhost:8080/api/v1/auth/forgot-password
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### Test Reset Password
```bash
POST http://localhost:8080/api/v1/auth/reset-password
Content-Type: application/json

{
    "token": "token-from-forgot-password-response",
    "newPassword": "newPassword123"
}
```
