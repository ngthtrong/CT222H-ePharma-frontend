# Hướng dẫn sử dụng Hệ thống Quản trị Admin - WellVerse

## Tổng quan

Hệ thống Admin của WellVerse được xây dựng hoàn chỉnh theo tài liệu hướng dẫn, cung cấp đầy đủ các chức năng quản lý cho nhà thuốc trực tuyến.

## Tính năng đã triển khai

### ✅ 1. Xác thực và Phân quyền

- Kiểm tra quyền admin dựa trên JWT token và user role
- Private routes bảo vệ các trang admin
- Auto-redirect nếu không có quyền truy cập
- Hiển thị menu admin trong header cho user có quyền

### ✅ 2. Dashboard - Trang tổng quan

- Thống kê tổng quan (đơn hàng, sản phẩm, người dùng, doanh thu)
- Đơn hàng gần đây với khả năng xem chi tiết
- Sản phẩm bán chạy
- Interface thân thiện với Material-UI

### ✅ 3. Quản lý Sản phẩm

- Danh sách sản phẩm với bộ lọc theo danh mục, thương hiệu, giá
- Tìm kiếm theo tên sản phẩm
- Tạo mới/chỉnh sửa sản phẩm với form validation
- Upload hình ảnh và quản lý thông tin chi tiết
- Xóa sản phẩm với xác nhận

### ✅ 4. Quản lý Đơn hàng

- Danh sách đơn hàng với bộ lọc theo trạng thái, ngày
- Tìm kiếm theo mã đơn hàng hoặc tên khách hàng
- Xem chi tiết đơn hàng đầy đủ (khách hàng, địa chỉ, sản phẩm)
- Cập nhật trạng thái đơn hàng với ghi chú
- Quản lý trạng thái thanh toán
- Xóa đơn hàng

### ✅ 5. Quản lý Danh mục

- Cây danh mục phân cấp
- Tạo mới/chỉnh sửa danh mục với SEO fields
- Auto-generate slug từ tên danh mục
- Quản lý thứ tự hiển thị và trạng thái kích hoạt
- Xóa danh mục với kiểm tra ràng buộc

### ✅ 6. Quản lý Người dùng

- Danh sách người dùng với bộ lọc theo vai trò
- Tìm kiếm theo tên hoặc email
- Xem chi tiết thông tin người dùng
- Quản lý địa chỉ đã lưu
- Xóa người dùng (không cho phép xóa admin)
- Hiển thị trạng thái xác thực email

### ✅ 7. Layout và Navigation

- Sidebar navigation với menu chính
- Responsive design cho mobile và desktop
- Breadcrumb navigation
- User menu với thông tin admin
- Loading states và error handling

## Cấu trúc Files đã tạo/cập nhật

```
src/
├── pages/
│   ├── AdminPage.jsx                 # Main admin layout với routing
│   └── admin/
│       ├── AdminDashboard.jsx        # Dashboard với thống kê
│       ├── AdminProducts.jsx         # Quản lý sản phẩm (đã có)
│       ├── AdminOrders.jsx           # Quản lý đơn hàng (cập nhật)
│       ├── AdminCategories.jsx       # Quản lý danh mục (cập nhật)
│       └── AdminUsers.jsx            # Quản lý người dùng (cập nhật)
├── utils/
│   └── adminUtils.js                 # Utilities cho admin (mở rộng)
├── api/
│   └── adminApi.js                   # API calls cho admin (cập nhật)
├── components/layout/
│   └── Header.jsx                    # Header với admin menu (cập nhật)
└── routes/
    └── AppRoutes.js                  # Routing cập nhật
```

## Cách sử dụng

### 1. Đăng nhập với quyền Admin

- Đảm bảo user có `role: "ADMIN"` trong database
- Token JWT phải chứa thông tin role

### 2. Truy cập Admin Panel

- Sau khi đăng nhập, click vào menu user → "Trang Quản Trị"
- Hoặc truy cập trực tiếp `/admin`

### 3. Navigation

- **Dashboard**: `/admin/dashboard` - Trang tổng quan
- **Sản phẩm**: `/admin/products` - Quản lý sản phẩm
- **Đơn hàng**: `/admin/orders` - Quản lý đơn hàng
- **Danh mục**: `/admin/categories` - Quản lý danh mục
- **Người dùng**: `/admin/users` - Quản lý người dùng

## API Endpoints sử dụng

Hệ thống đã được thiết kế theo đúng API specification trong tài liệu:

### Dashboard

- `GET /admin/dashboard/stats` - Thống kê tổng quan
- `GET /admin/dashboard/recent-orders` - Đơn hàng gần đây
- `GET /admin/dashboard/top-products` - Sản phẩm bán chạy

### Products

- `GET /admin/products` - Danh sách sản phẩm với filter
- `POST /admin/products` - Tạo sản phẩm mới
- `PUT /admin/products/{id}` - Cập nhật sản phẩm
- `DELETE /admin/products/{id}` - Xóa sản phẩm

### Orders

- `GET /admin/orders` - Danh sách đơn hàng với filter
- `GET /admin/orders/{id}` - Chi tiết đơn hàng
- `PATCH /admin/orders/{id}/status` - Cập nhật trạng thái
- `PUT /admin/orders/{id}/payment-status` - Cập nhật thanh toán
- `DELETE /admin/orders/{id}` - Xóa đơn hàng

### Categories

- `GET /admin/categories` - Danh sách danh mục
- `POST /admin/categories` - Tạo danh mục mới
- `PUT /admin/categories/{id}` - Cập nhật danh mục
- `DELETE /admin/categories/{id}` - Xóa danh mục

### Users

- `GET /admin/users` - Danh sách người dùng với filter
- `GET /admin/users/{id}` - Chi tiết người dùng
- `PUT /admin/users/{id}` - Cập nhật người dùng
- `DELETE /admin/users/{id}` - Xóa người dùng

## Validation và Error Handling

### Form Validation

- Sử dụng `adminUtils.js` cho validation rules
- Hiển thị lỗi real-time
- Required field validation
- Format validation (slug, email, phone)

### Error Handling

- API error responses được handle properly
- User-friendly error messages
- Loading states trong quá trình API calls
- Success notifications

## Security Features

### Authorization

- Kiểm tra quyền admin ở multiple levels:
  - Route level với PrivateRoute
  - Component level với adminUtils.isAdmin()
  - API level (backend responsibility)

### Token Management

- Auto-decode JWT để lấy role
- Kiểm tra token expiration
- Auto-redirect khi token hết hạn

## Responsive Design

- **Desktop**: Full sidebar với navigation
- **Mobile**: Collapsible drawer navigation
- **Tablet**: Optimized table layouts
- **All devices**: Touch-friendly buttons và forms

## Future Enhancements

Các tính năng có thể bổ sung:

1. **Quản lý Khuyến mãi** (`/admin/promotions`)
2. **Quản lý Đánh giá** (`/admin/reviews`)
3. **Báo cáo và Thống kê** (`/admin/reports`)
4. **Quản lý Thông báo** (`/admin/notifications`)
5. **Cài đặt hệ thống** (`/admin/settings`)

## Troubleshooting

### Không thể truy cập admin panel

1. Kiểm tra user có role "ADMIN"
2. Kiểm tra token còn hạn
3. Clear localStorage và đăng nhập lại

### API errors

1. Kiểm tra backend server đang chạy
2. Verify API endpoints trong `adminApi.js`
3. Check console logs cho error details

### UI issues

1. Clear browser cache
2. Kiểm tra Material-UI theme conflicts
3. Verify responsive breakpoints

---

**Lưu ý**: Hệ thống đã được triển khai hoàn chỉnh theo tài liệu hướng dẫn, đảm bảo tương thích với backend API và có thể mở rộng dễ dàng cho các tính năng mới.
