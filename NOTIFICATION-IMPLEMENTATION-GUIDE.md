# Hướng dẫn sử dụng tính năng Thông báo

## Tổng quan

Tính năng thông báo đã được hoàn thiện với đầy đủ chức năng cho cả **User** và **Admin**:

### Cho User:
- ✅ Xem thông báo trong icon chuông trên Header
- ✅ Đánh dấu thông báo đã đọc
- ✅ Xem danh sách chi tiết tất cả thông báo
- ✅ Lọc và tìm kiếm thông báo
- ✅ Thống kê số thông báo chưa đọc

### Cho Admin:
- ✅ Gửi thông báo cho user cụ thể
- ✅ Gửi broadcast thông báo cho tất cả user
- ✅ Quản lý danh sách thông báo
- ✅ Xóa thông báo
- ✅ Xem chi tiết thông báo

---

## Cách sử dụng

### 1. Thông báo cho User

#### Xem thông báo nhanh:
- Click vào icon 🔔 trên Header (chỉ hiện khi đã đăng nhập)
- Dropdown sẽ hiển thị 10 thông báo mới nhất
- Click vào thông báo để đánh dấu đã đọc
- Badge đỏ hiển thị số thông báo chưa đọc

#### Xem tất cả thông báo:
- Click "Xem tất cả thông báo" trong dropdown
- Hoặc truy cập: `/notifications`
- Có thể lọc theo loại, trạng thái, tìm kiếm
- Xem chi tiết từng thông báo

### 2. Quản lý thông báo cho Admin

#### Truy cập:
- Đăng nhập với tài khoản Admin
- Vào **Admin Panel** → **Thông báo**
- Hoặc truy cập: `/admin/notifications`

#### Gửi thông báo:
1. Chọn tab "Gửi thông báo"
2. Điền thông tin:
   - **Tiêu đề**: Tối đa 200 ký tự
   - **Nội dung**: Tối đa 1000 ký tự
   - **Loại thông báo**: Chọn từ dropdown
   - **User ID**: Để trống = gửi tất cả, nhập ID = gửi cá nhân
   - **Related ID**: Tùy chọn (ID đơn hàng, sản phẩm liên quan)
3. Click "Gửi thông báo" hoặc "Gửi broadcast"

#### Quản lý thông báo:
1. Chọn tab "Danh sách thông báo"
2. Xem tất cả thông báo đã gửi
3. Thao tác:
   - 👁️ Xem chi tiết
   - 🗑️ Xóa thông báo

---

## Các loại thông báo

| Loại | Icon | Mô tả | Màu sắc |
|------|------|--------|---------|
| **ORDER** | 📦 | Thông báo liên quan đến đơn hàng | Xanh (info) |
| **PRODUCT** | 🛍️ | Thông báo về sản phẩm | Xanh đậm (primary) |
| **PROMOTION** | 🎉 | Thông báo khuyến mãi | Xanh lá (success) |
| **SYSTEM** | ⚙️ | Thông báo hệ thống | Vàng (warning) |
| **REVIEW** | ⭐ | Thông báo đánh giá | Tím (secondary) |
| **GENERAL** | 📢 | Thông báo chung | Xám (default) |

---

## Tính năng kỹ thuật

### Files đã tạo/cập nhật:

#### 1. API Layer:
- `src/api/notificationApi.js` - API calls và constants
- `src/api/index.js` - Export notification API

#### 2. Hooks:
- `src/hooks/useNotifications.js` - Hook quản lý state thông báo

#### 3. Components:
- `src/components/NotificationBell.jsx` - Icon chuông thông báo trên Header

#### 4. Pages:
- `src/pages/NotificationPage.jsx` - Trang danh sách thông báo cho user
- `src/pages/admin/AdminNotifications.jsx` - Trang quản lý thông báo cho admin

#### 5. Updates:
- `src/components/layout/Header.jsx` - Thêm NotificationBell
- `src/pages/AdminPage.jsx` - Integrate AdminNotifications
- `src/App.jsx` - Thêm route `/notifications`
- `package.json` - Thêm dependency `date-fns`

### Dependencies mới:
```json
{
  "date-fns": "^latest" // Format thời gian
}
```

---

## Giao diện & UX

### Thiết kế tương thích:
- ✅ Sử dụng Material-UI theme hiện tại
- ✅ Responsive design
- ✅ Dark/Light mode support
- ✅ Icon và màu sắc nhất quán
- ✅ Animation smooth

### User Experience:
- ✅ Real-time badge counter
- ✅ Intuitive click-to-read
- ✅ Quick actions từ dropdown
- ✅ Comprehensive filtering
- ✅ Mobile-friendly

---

## API Endpoints được sử dụng

### User Endpoints:
```
GET    /api/v1/notifications              # Lấy thông báo của user
PATCH  /api/v1/notifications/{id}/read    # Đánh dấu đã đọc
GET    /api/v1/notifications/unread-count # Đếm thông báo chưa đọc
```

### Admin Endpoints:
```
POST   /api/v1/admin/notifications        # Gửi thông báo
GET    /api/v1/admin/notifications        # Lấy tất cả thông báo
DELETE /api/v1/admin/notifications/{id}   # Xóa thông báo
```

---

## Lưu ý triển khai

### 1. Authentication:
- User endpoints yêu cầu JWT token
- Admin endpoints yêu cầu admin JWT token
- NotificationBell chỉ hiện khi đã đăng nhập

### 2. Error Handling:
- Graceful fallback khi API fail
- Loading states cho UX tốt
- Error messages user-friendly

### 3. Performance:
- Lazy loading cho danh sách dài
- Debouncing cho search
- Caching với React state

### 4. Future Enhancements:
- [ ] WebSocket real-time notifications
- [ ] Push notifications
- [ ] Email notifications
- [ ] Notification preferences
- [ ] Bulk operations

---

## Cách test

### 1. Test User Features:
1. Đăng nhập với tài khoản user
2. Check icon chuông trên Header
3. Truy cập `/notifications`
4. Test các filter và search

### 2. Test Admin Features:
1. Đăng nhập với tài khoản admin
2. Vào Admin Panel → Thông báo
3. Test gửi thông báo cá nhân và broadcast
4. Check danh sách và delete

### 3. Test Integration:
1. Admin gửi thông báo
2. User check chuông notification
3. Verify badge count
4. Test mark as read

---

Tính năng thông báo đã được hoàn thiện và tích hợp hoàn toàn với hệ thống hiện tại!
