# Hướng Dẫn Sử Dụng Notification API cho Frontend

## Tổng Quan

API Notification hỗ trợ hệ thống thông báo cho cả **User** và **Admin**. User có thể nhận và quản lý thông báo cá nhân, Admin có thể gửi thông báo cho user cụ thể hoặc broadcast đến tất cả user.

- **User**: Xem thông báo cá nhân, đánh dấu đã đọc, đếm thông báo chưa đọc
- **Admin**: Gửi thông báo cá nhân hoặc broadcast, quản lý tất cả thông báo, xóa thông báo

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

## Notification Types

### Loại Thông Báo
- `ORDER`: Thông báo liên quan đến đơn hàng
- `PRODUCT`: Thông báo liên quan đến sản phẩm
- `PROMOTION`: Thông báo khuyến mãi
- `SYSTEM`: Thông báo hệ thống
- `REVIEW`: Thông báo về đánh giá
- `GENERAL`: Thông báo chung

---

## USER API ENDPOINTS

### 1. Lấy Danh Sách Thông Báo Của User

**GET** `/notifications`

**Mô tả**: Lấy tất cả thông báo của user hiện tại

```javascript
async function getUserNotifications() {
    const response = await fetch('/api/v1/notifications', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of NotificationResponse
}
```

**Response Example**:
```json
{
    "success": true,
    "message": "Lấy danh sách thông báo thành công",
    "data": [
        {
            "id": "notif_001",
            "userId": "user_123",
            "userName": "Nguyễn Văn A",
            "title": "Đơn hàng đã được xác nhận",
            "message": "Đơn hàng ORD-20250131-001 của bạn đã được xác nhận và đang được chuẩn bị.",
            "type": "ORDER",
            "relatedId": "order_001",
            "isRead": false,
            "createdAt": "2025-01-31T10:30:00Z"
        },
        {
            "id": "notif_002",
            "userId": "user_123",
            "userName": "Nguyễn Văn A",
            "title": "Khuyến mãi đặc biệt",
            "message": "Flash Sale cuối tuần - Giảm 50% tất cả sản phẩm vitamin!",
            "type": "PROMOTION",
            "relatedId": "promo_001",
            "isRead": true,
            "createdAt": "2025-01-30T08:00:00Z"
        }
    ]
}
```

### 2. Đánh Dấu Thông Báo Đã Đọc

**PATCH** `/notifications/{id}/read`

**Mô tả**: Đánh dấu một thông báo cụ thể là đã đọc

```javascript
async function markNotificationAsRead(notificationId) {
    const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Updated NotificationResponse
}
```

### 3. Đếm Thông Báo Chưa Đọc

**GET** `/notifications/unread-count`

**Mô tả**: Lấy số lượng thông báo chưa đọc của user

```javascript
async function getUnreadNotificationCount() {
    const response = await fetch('/api/v1/notifications/unread-count', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Number
}
```

**Response Example**:
```json
{
    "success": true,
    "message": "Lấy số thông báo chưa đọc thành công",
    "data": 3
}
```

---

## ADMIN API ENDPOINTS

### 1. Gửi Thông Báo

**POST** `/admin/notifications`

**Mô tả**: Admin gửi thông báo đến user cụ thể hoặc broadcast đến tất cả user

**Request Body cho thông báo cá nhân**:
```json
{
    "title": "Đơn hàng của bạn đã được giao",
    "message": "Đơn hàng ORD-20250131-001 đã được giao thành công. Cảm ơn bạn đã mua sắm tại cửa hàng!",
    "type": "ORDER",
    "relatedId": "order_001",
    "userId": "user_123"
}
```

**Request Body cho broadcast**:
```json
{
    "title": "Thông báo bảo trì hệ thống",
    "message": "Hệ thống sẽ được bảo trì từ 2:00 - 4:00 sáng ngày 01/02/2025. Vui lòng không thực hiện giao dịch trong thời gian này.",
    "type": "SYSTEM",
    "relatedId": null,
    "userId": null
}
```

```javascript
// Gửi thông báo cho user cụ thể
async function sendNotificationToUser(notificationData) {
    const response = await fetch('/api/v1/admin/notifications', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
    });
    
    const data = await response.json();
    return data.data; // NotificationResponse object
}

// Broadcast thông báo đến tất cả user
async function broadcastNotification(notificationData) {
    // Bỏ qua userId hoặc set userId = null để broadcast
    const broadcastData = { ...notificationData, userId: null };
    
    const response = await fetch('/api/v1/admin/notifications', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(broadcastData)
    });
    
    const data = await response.json();
    return data.data; // Array of NotificationResponse objects cho broadcast
}
```

**Validation Rules**:
- `title`: Bắt buộc, tối đa 200 ký tự
- `message`: Bắt buộc, tối đa 1000 ký tự  
- `type`: Bắt buộc (ORDER, PRODUCT, PROMOTION, SYSTEM, REVIEW, GENERAL)
- `relatedId`: Tùy chọn - ID của object liên quan
- `userId`: Tùy chọn - Nếu null thì broadcast đến tất cả user

### 2. Lấy Tất Cả Thông Báo (Admin)

**GET** `/admin/notifications`

**Mô tả**: Admin lấy tất cả thông báo trong hệ thống

```javascript
async function getAllNotifications() {
    const response = await fetch('/api/v1/admin/notifications', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of NotificationResponse
}
```

### 3. Xóa Thông Báo

**DELETE** `/admin/notifications/{id}`

**Mô tả**: Admin xóa thông báo cụ thể

```javascript
async function deleteNotification(notificationId) {
    const response = await fetch(`/api/v1/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.ok;
}
```

---

## Data Models

### NotificationRequest
```javascript
{
    title: string,      // Bắt buộc - Tiêu đề thông báo (max 200 chars)
    message: string,    // Bắt buộc - Nội dung thông báo (max 1000 chars)
    type: string,       // Bắt buộc - Loại thông báo
    relatedId: string,  // Tùy chọn - ID object liên quan
    userId: string      // Tùy chọn - ID user (null = broadcast)
}
```

### NotificationResponse
```javascript
{
    id: string,         // ID thông báo
    userId: string,     // ID người nhận
    userName: string,   // Tên người nhận
    title: string,      // Tiêu đề thông báo
    message: string,    // Nội dung thông báo
    type: string,       // Loại thông báo
    relatedId: string,  // ID object liên quan
    isRead: boolean,    // Trạng thái đã đọc
    createdAt: string   // Thời gian tạo
}
```

---

## Error Handling

### Common Error Responses

**404 Not Found** - Không tìm thấy thông báo:
```json
{
    "success": false,
    "message": "Không tìm thấy thông báo",
    "data": null
}
```

**400 Bad Request** - Dữ liệu không hợp lệ:
```json
{
    "success": false,
    "message": "Tiêu đề thông báo không được để trống",
    "data": null
}
```

**401 Unauthorized** - Chưa đăng nhập:
```json
{
    "success": false,
    "message": "Token không hợp lệ",
    "data": null
}
```

**403 Forbidden** - Không có quyền truy cập:
```json
{
    "success": false,
    "message": "Bạn không có quyền truy cập tính năng này",
    "data": null
}
```

---

## Frontend Integration Examples

### React Hook cho Notification Management

```javascript
import { useState, useEffect } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getUserNotifications();
            setNotifications(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        refresh: () => {
            fetchNotifications();
            fetchUnreadCount();
        }
    };
};
```

### Notification Bell Component

```javascript
const NotificationBell = () => {
    const { unreadCount, notifications, markAsRead } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="notification-bell">
            <button 
                className="bell-button"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notifications-dropdown">
                    <div className="dropdown-header">
                        <h3>Thông báo</h3>
                        <span className="unread-count">{unreadCount} chưa đọc</span>
                    </div>
                    
                    <div className="notifications-list">
                        {notifications.slice(0, 10).map(notification => (
                            <div 
                                key={notification.id}
                                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="dropdown-footer">
                        <button>Xem tất cả</button>
                    </div>
                </div>
            )}
        </div>
    );
};
```

### Admin Notification Sender

```javascript
const NotificationSender = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'GENERAL',
        userId: '', // empty = broadcast
        relatedId: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.userId) {
                await sendNotificationToUser(formData);
            } else {
                await broadcastNotification(formData);
            }
            alert('Thông báo đã được gửi thành công!');
            setFormData({
                title: '',
                message: '',
                type: 'GENERAL',
                userId: '',
                relatedId: ''
            });
        } catch (error) {
            alert('Gửi thông báo thất bại: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    maxLength={200}
                    required
                />
            </div>

            <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    maxLength={1000}
                    required
                />
            </div>

            <div className="form-group">
                <label>Loại thông báo:</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                    <option value="GENERAL">Chung</option>
                    <option value="ORDER">Đơn hàng</option>
                    <option value="PRODUCT">Sản phẩm</option>
                    <option value="PROMOTION">Khuyến mãi</option>
                    <option value="SYSTEM">Hệ thống</option>
                </select>
            </div>

            <div className="form-group">
                <label>User ID (để trống = gửi tất cả):</label>
                <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    placeholder="Để trống để gửi broadcast"
                />
            </div>

            <button type="submit">
                {formData.userId ? 'Gửi thông báo' : 'Gửi broadcast'}
            </button>
        </form>
    );
};
```

---

## Notes

1. **Polling**: Sử dụng HTTP polling để cập nhật thông báo real-time
2. **Pagination**: Với lượng thông báo lớn, nên implement pagination
3. **Push Notifications**: Có thể tích hợp với service worker cho push notifications
4. **Auto-read**: Consider tự động đánh dấu đã đọc khi user click vào thông báo
5. **Cleanup**: Nên có cơ chế cleanup thông báo cũ để tránh database quá tải
