# 🔌 WebSocket Setup Guide

## Overview

Dự án này hỗ trợ WebSocket cho các tính năng real-time, nhưng hoàn toàn có thể hoạt động mà không cần WebSocket.

## Quick Setup

### 1. Enable WebSocket (Recommended if backend supports)

```bash
# In .env.local
VITE_DISABLE_WEBSOCKET=false
VITE_API_URL=http://localhost:8081/api/v1
```

### 2. Disable WebSocket (If backend doesn't support)

```bash  
# In .env.local
VITE_DISABLE_WEBSOCKET=true
VITE_API_URL=http://localhost:8081/api/v1
```

## WebSocket Endpoints

Frontend sẽ thử kết nối theo thứ tự:

1. `ws://localhost:8081/ws-analytics` (Primary)
2. `ws://localhost:8081/ws` (Fallback)
3. `ws://localhost:8080/ws-analytics` (Alternative port)  
4. `ws://localhost:8080/ws` (Alternative port fallback)

## Topics Supported

Theo `WEBSOCKET-CONFIG.md` từ backend:

- `/topic/realtime-metrics` - Cập nhật metrics real-time
- `/topic/order-updates` - Thông báo đơn hàng mới
- `/topic/revenue-updates` - Cập nhật doanh thu
- `/topic/active-users` - Số người dùng online

## Features Matrix

| Feature | With WebSocket | Without WebSocket |
|---------|----------------|-------------------|
| Dashboard Analytics | ✅ | ✅ |
| Charts & Visualizations | ✅ | ✅ |
| Export (Excel/PDF) | ✅ | ✅ |
| Date Range Filtering | ✅ | ✅ |
| Admin Management | ✅ | ✅ |
| **Real-time Updates** | ✅ | ❌ |
| **Live Notifications** | ✅ | ❌ |
| **Active User Count** | ✅ | ❌ |

## Troubleshooting

### WebSocket Connection Errors

Nếu thấy lỗi WebSocket trong console:

1. **Normal**: Nếu backend chưa có WebSocket, lỗi này là bình thường
2. **Solution**: Set `VITE_DISABLE_WEBSOCKET=true` trong `.env.local`
3. **Dashboard vẫn hoạt động**: Tất cả tính năng (trừ real-time) vẫn hoạt động qua HTTP API

### Performance Tips

- **WebSocket disabled** = Performance tốt hơn cho development
- **Dashboard load nhanh hơn** không cần thử kết nối
- **Dữ liệu vẫn fresh** qua HTTP API calls
- **Real-time updates** chỉ là nice-to-have, không bắt buộc

## Console Messages

### WebSocket Enabled & Working
```
🚀 Initializing WebSocket Analytics (real-time features enabled)
🔌 Attempting WebSocket connection to: ws://localhost:8081/ws-analytics
✅ WebSocket Analytics connected successfully to: ws://localhost:8081/ws-analytics
📡 Subscribing to WebSocket topics: ["/topic/realtime-metrics", ...]
```

### WebSocket Disabled
```
ℹ️ WebSocket disabled - dashboard runs in HTTP-only mode (all features available)
```

### WebSocket Failed (Expected)
```
⚠️ WebSocket not available - running in offline mode (all features still work via HTTP API)
ℹ️ All WebSocket endpoints tried - switching to HTTP-only mode (dashboard still fully functional)
```

## Backend Integration

Nếu muốn implement WebSocket ở backend, tham khảo:
- `ADVANCED-ANALYTICS-API-GUIDE.md` cho message formats
- `WEBSOCKET-CONFIG.md` cho configuration details
