# Docker Setup Guide

## Batch Scripts (Windows)

### Sử dụng file batch để quản lý Docker dễ dàng:

- **docker-start.bat** - Khởi động containers với menu lựa chọn
- **docker-stop.bat** - Dừng containers với menu lựa chọn  
- **docker-logs.bat** - Xem logs containers
- **docker-manager.bat** - Quản lý Docker tổng thể với menu đầy đủ

### Cách sử dụng:
```cmd
# Khởi động containers
docker-start.bat

# Dừng containers
docker-stop.bat

# Xem logs
docker-logs.bat

# Quản lý tổng thể (recommended)
docker-manager.bat
```

## Các lệnh Docker có sẵn

### Development
```bash
# Chạy frontend trong chế độ development
npm run docker:dev

# Dừng development containers
npm run docker:dev-down

# Xem logs của frontend
npm run docker:logs
```

### Production
```bash
# Build và chạy production version
npm run docker:prod-up

# Dừng production containers
npm run docker:prod-down
```

### Lệnh Docker cơ bản
```bash
# Build image development
npm run docker:build

# Chạy container từ image đã build
npm run docker:run

# Build image production
npm run docker:prod

# Chạy production container
npm run docker:run-prod

# Dọn dẹp Docker
npm run docker:clean
```

## Cấu trúc Files

- `Dockerfile` - Development environment
- `Dockerfile.prod` - Production environment với Nginx
- `docker-compose.yml` - Full stack development
- `docker-compose.dev.yml` - Chỉ frontend development
- `docker-compose.prod.yml` - Production deployment
- `nginx.conf` - Nginx configuration cho production

## Kết nối với Backend

Nếu bạn đã có backend chạy trong Docker khác, bạn có thể:

1. Thêm backend service vào `docker-compose.yml`
2. Hoặc kết nối frontend với backend network hiện có
3. Cấu hình biến môi trường `VITE_API_URL` trong docker-compose files

## Ports

- Development: http://localhost:5173
- Production: http://localhost:80
