# WellVerse - Hệ thống Frontend cho Nhà thuốc

## Tổng quan
WellVerse là một ứng dụng web frontend cho hệ thống nhà thuốc, được xây dựng với React, Material-UI và Vite. Hệ thống cung cấp giao diện thân thiện cho việc mua sắm các sản phẩm dược phẩm và chăm sóc sức khỏe.

## Tính năng chính

### 🔐 **Xác thực người dùng**
- Đăng ký tài khoản mới
- Đăng nhập/đăng xuất
- Quản lý thông tin profile cá nhân
- Bảo vệ route với authentication

### 🛍️ **Quản lý sản phẩm**
- Xem danh sách sản phẩm với phân trang
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm
- Phân loại theo danh mục

### 👤 **Quản lý người dùng**
- Xem và chỉnh sửa thông tin cá nhân
- Quản lý đơn hàng
- Lịch sử mua sắm

### 🛒 **Giỏ hàng**
- Thêm/xóa sản phẩm
- Cập nhật số lượng
- Tính toán tổng tiền

### 👨‍💼 **Quản trị viên**
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục (CRUD)
- Quản lý người dùng
- Dashboard thống kê

## Công nghệ sử dụng

- **React 19.1.0** - Thư viện JavaScript cho UI
- **Material-UI 7.2.0** - Component library
- **Vite 7.0.0** - Build tool
- **React Router 7.6.3** - Điều hướng
- **Axios 1.10.0** - HTTP client
- **React Slick 0.30.3** - Carousel component

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd project-front-end

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Truy cập ứng dụng
# Mở trình duyệt và truy cập http://localhost:5173
```

### Scripts có sẵn
```bash
# Development
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Check linting

# Docker commands
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run docker:dev      # Run dev environment with Docker
```

## Cấu trúc dự án

```
src/
├── components/         # Các components tái sử dụng
│   ├── layout/        # Layout components (Header, Footer)
│   ├── ProductCard.jsx
│   └── PrivateRoute.jsx
├── pages/             # Các trang chính
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── ProfilePage.jsx
│   ├── CartPage.jsx
│   └── AdminPage.jsx
├── services/          # API services
│   └── api.js
├── contexts/          # React contexts
│   └── AuthContext.jsx
├── App.jsx           # Main App component
├── main.jsx          # Entry point
└── theme.js          # Material-UI theme
```

## API Integration

### Backend URL
Mặc định: `http://localhost:8081/api`

### Authentication APIs
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin profile

### Product APIs
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Category APIs
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### User Management APIs
- `GET /api/users` - Lấy danh sách users (Admin)
- `GET /api/users/:id` - Lấy thông tin user theo ID
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user (Admin)

## Tính năng nâng cao

### Authentication Context
- Quản lý trạng thái đăng nhập toàn cục
- Tự động refresh token
- Redirect khi session hết hạn

### Route Protection
- Private routes cho các trang cần authentication
- Admin routes cho quản trị viên
- Redirect về login page nếu chưa xác thực

### Error Handling
- Xử lý lỗi API tập trung
- Hiển thị thông báo lỗi thân thiện
- Retry mechanism cho các request thất bại

### Responsive Design
- Tối ưu cho mobile, tablet, desktop
- Sử dụng Material-UI breakpoints
- Mobile-first approach

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Build production image
npm run docker:prod

# Run production container
npm run docker:run-prod
```

## Troubleshooting

### Common Issues

1. **CORS Error**
   - Đảm bảo backend đã cấu hình CORS cho frontend URL
   - Kiểm tra API base URL trong `src/services/api.js`

2. **Authentication Issues**
   - Xóa localStorage và thử đăng nhập lại
   - Kiểm tra token format và expiry

3. **Build Errors**
   - Xóa `node_modules` và `package-lock.json`
   - Chạy `npm install` lại
   - Kiểm tra Node.js version

4. **API Connection**
   - Đảm bảo backend server đang chạy
   - Kiểm tra network connectivity
   - Verify API endpoints

## Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## License

This project is licensed under the MIT License.

## Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần Troubleshooting
2. Tìm kiếm trong Issues
3. Tạo issue mới với thông tin chi tiết

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 18/07/2025
